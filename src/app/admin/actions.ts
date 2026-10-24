"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminSession, destroyAdminSession, isAdminConfigured, requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { notify } from "@/lib/reservations/notifications";
import { changeReservationStatus, ReservationError, TRANSITIONS } from "@/lib/reservations/service";
import { getReservationSettings, resetReservationSettings, saveReservationSettings } from "@/lib/reservations/settings-store";
import { reservationSettingsSchema, type DateOverride, type TimeWindow } from "@/lib/reservations/settings-schema";
import { isValidDate, parseTime } from "@/lib/reservations/time";
import { checkRateLimit, clientIp, RATE_LIMITS } from "@/lib/security/rate-limit";

export interface FormState {
  ok: boolean;
  message: string | null;
  /** Valor a conservar en el formulario tras un error (React reinicia los campos al enviar). */
  email?: string;
}

/* ─────────────── Autenticación ─────────────── */

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isAdminConfigured()) return { ok: false, message: "El acceso de administración no está configurado (revisa las variables de entorno)." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const ip = clientIp(await headers());

  const [byIp, byEmail] = await Promise.all([
    checkRateLimit(RATE_LIMITS.login, `ip:${ip}`),
    checkRateLimit(RATE_LIMITS.login, `email:${email}`),
  ]);
  if (!byIp.ok || !byEmail.ok) {
    return { ok: false, email, message: `Demasiados intentos. Vuelve a intentarlo en ${Math.ceil(Math.max(byIp.retryAfter, byEmail.retryAfter) / 60)} minutos.` };
  }

  const emailOk = email === process.env.ADMIN_EMAIL!.toLowerCase();
  // Se verifica siempre la contraseña (aunque el correo no coincida) para no revelar qué falló por diferencias de tiempo.
  const passwordOk = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!);
  if (!emailOk || !passwordOk) return { ok: false, email, message: "Correo o contraseña incorrectos." };

  await createAdminSession(email);
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

/* ─────────────── Reservas ─────────────── */

const statusActionSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(Object.keys(TRANSITIONS) as [keyof typeof TRANSITIONS, ...(keyof typeof TRANSITIONS)[]]),
});

export async function changeStatusAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin();
  const parsed = statusActionSchema.safeParse({ id: formData.get("id"), action: formData.get("action") });
  if (!parsed.success) return { ok: false, message: "Acción no válida." };
  try {
    const updated = await changeReservationStatus(parsed.data.id, parsed.data.action, `admin:${session.sub}`);
    const event = ({ confirm: "confirmed", decline: "declined", cancel: "cancelled" } as const)[parsed.data.action as "confirm" | "decline" | "cancel"];
    if (event) await notify(event, updated);
    refresh();
    return { ok: true, message: null };
  } catch (err) {
    if (err instanceof ReservationError) return { ok: false, message: err.message };
    console.error("[admin] cambio de estado", err);
    return { ok: false, message: "No se pudo actualizar la reserva." };
  }
}

/* ─────────────── Bloqueos ─────────────── */

export async function createBlockAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const date = String(formData.get("date") ?? "");
  const allDay = formData.get("allDay") === "on";
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 120);

  if (!isValidDate(date)) return { ok: false, message: "Indica una fecha válida." };
  let startMinutes: number | null = null;
  let endMinutes: number | null = null;
  if (!allDay) {
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return { ok: false, message: "Indica hora de inicio y fin, o marca «Todo el día»." };
    startMinutes = parseTime(start);
    endMinutes = parseTime(end);
    if (endMinutes <= startMinutes) return { ok: false, message: "La hora de fin debe ser posterior a la de inicio." };
  }
  const db = await getDb();
  await db.query(`insert into reservation_blocks (block_date, start_minutes, end_minutes, reason) values ($1,$2,$3,$4)`, [
    date,
    startMinutes,
    endMinutes,
    reason || null,
  ]);
  refresh();
  return { ok: true, message: "Bloqueo creado. Las reservas ya existentes en ese periodo no se modifican: revísalas en el listado." };
}

export async function deleteBlockAction(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;
  const db = await getDb();
  await db.query(`delete from reservation_blocks where id = $1`, [id.data]);
  refresh();
}

/* ─────────────── Ajustes ─────────────── */

/** «13:00-16:30 Mediodía, 19:30-23:30 Noche» → franjas. Vacío o «cerrado» → []. */
function parseWindows(text: string, label: string): TimeWindow[] {
  const value = text.trim();
  if (!value || /^cerrado$/i.test(value)) return [];
  return value.split(",").map((part) => {
    const m = part.trim().match(/^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})(?:\s+(.+))?$/);
    if (!m) throw new Error(`${label}: no se entiende «${part.trim()}». Usa el formato 13:00-16:30 Mediodía`);
    const pad = (t: string) => t.padStart(5, "0");
    return { start: pad(m[1]), end: pad(m[2]), ...(m[3] ? { label: m[3].trim() } : {}) };
  });
}

/** Una línea por fecha: «2026-12-25 cerrado Navidad» o «2026-12-31 20:00-24:00 Cena especial». */
function parseOverrides(text: string): DateOverride[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(\d{4}-\d{2}-\d{2})\s+(.+)$/);
      if (!m || !isValidDate(m[1])) throw new Error(`Horarios especiales: línea no válida «${line}»`);
      const rest = m[2].trim();
      const closed = rest.match(/^cerrado(?:\s+(.*))?$/i);
      if (closed) return { date: m[1], closed: true, ...(closed[1] ? { note: closed[1].slice(0, 120) } : {}) };
      return { date: m[1], windows: parseWindows(rest, `Horario especial ${m[1]}`) };
    });
}

export async function resetSettingsAction(): Promise<FormState> {
  await requireAdmin();
  await resetReservationSettings();
  refresh();
  return { ok: true, message: "Se han restaurado los valores de config/reservations.ts." };
}

export async function saveSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  try {
    const current = await getReservationSettings();
    const num = (k: string) => Number(formData.get(k));
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const maxPerArrival = String(formData.get("maxCoversPerArrival") ?? "").trim();

    const candidate = {
      ...current,
      timezone: String(formData.get("timezone") ?? current.timezone).trim(),
      confirmationMode: formData.get("confirmationMode") === "auto" ? "auto" : "manual",
      partySize: { min: num("partyMin"), max: num("partyMax") },
      slotIntervalMinutes: num("slotIntervalMinutes"),
      reservationDurationMinutes: num("reservationDurationMinutes"),
      lastArrivalBeforeCloseMinutes: num("lastArrivalBeforeCloseMinutes"),
      capacity: { maxConcurrentCovers: num("maxConcurrentCovers"), maxCoversPerArrival: maxPerArrival ? Number(maxPerArrival) : null },
      minNoticeMinutes: num("minNoticeMinutes"),
      maxDaysAhead: num("maxDaysAhead"),
      weeklySchedule: days.map((d, i) => parseWindows(String(formData.get(`day${i}`) ?? ""), d)),
      dateOverrides: parseOverrides(String(formData.get("dateOverrides") ?? "")),
    };
    const parsed = reservationSettingsSchema.safeParse(candidate);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { ok: false, message: `Revisa «${issue.path.join(" › ")}»: ${issue.message}` };
    }
    await saveReservationSettings(parsed.data);
    refresh();
    return { ok: true, message: "Ajustes guardados. Se aplican de inmediato a las nuevas reservas." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "No se pudieron guardar los ajustes." };
  }
}
