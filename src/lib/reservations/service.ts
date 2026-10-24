import "server-only";
import { getDb } from "@/lib/db/client";
import { randomToken, reservationReference, sha256 } from "@/lib/security/crypto";
import { openDatesBetween, slotsFor, type Slot } from "./availability";
import {
  blocksBetween,
  findByIdempotencyKey,
  findByManageTokenHash,
  findDuplicate,
  insertReservation,
  lockDate,
  occupyingReservations,
  updateStatus,
  type ReservationRecord,
} from "./repository";
import type { ReservationRequest, ReservationStatus } from "./request-schema";
import { getReservationSettings } from "./settings-store";
import type { ReservationSettings } from "./settings-schema";
import { addDays, minutesUntil, nowInTimezone, parseTime } from "./time";

export type ReservationErrorCode =
  | "party_size"
  | "date_unavailable"
  | "slot_unavailable"
  | "duplicate"
  | "invalid_transition"
  | "not_found";

export class ReservationError extends Error {
  constructor(
    public code: ReservationErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export async function getMonthAvailability(from: string, days: number) {
  const db = await getDb();
  const settings = await getReservationSettings(db);
  const now = nowInTimezone(settings.timezone);
  const blocks = await blocksBetween(db, from, addDays(from, days));
  return { settings, today: now.date, dates: openDatesBetween(from, days, settings, blocks, now) };
}

export async function getDaySlots(date: string, partySize: number): Promise<{ settings: ReservationSettings; slots: Slot[] }> {
  const db = await getDb();
  const settings = await getReservationSettings(db);
  if (partySize < settings.partySize.min || partySize > settings.partySize.max) return { settings, slots: [] };
  const [reservations, blocks] = await Promise.all([occupyingReservations(db, date), blocksBetween(db, date, date)]);
  const now = nowInTimezone(settings.timezone);
  return { settings, slots: slotsFor({ date, partySize, settings, reservations, blocks, now }) };
}

export interface CreatedReservation {
  reservation: ReservationRecord;
  /** Token en claro para el enlace de gestión. Solo existe en el momento de la creación. */
  manageToken: string | null;
  replayed: boolean;
}

/**
 * Crea una reserva comprobando la disponibilidad real dentro de una transacción con bloqueo
 * por fecha, de modo que dos solicitudes simultáneas no puedan superar la capacidad.
 */
export async function createReservation(input: ReservationRequest, now: Date = new Date()): Promise<CreatedReservation> {
  const db = await getDb();

  const existing = await findByIdempotencyKey(db, input.idempotencyKey);
  if (existing) return { reservation: existing, manageToken: null, replayed: true };

  const settings = await getReservationSettings(db);
  if (input.partySize < settings.partySize.min || input.partySize > settings.partySize.max) {
    throw new ReservationError(
      "party_size",
      `Las reservas online admiten de ${settings.partySize.min} a ${settings.partySize.max} personas. Para grupos más grandes, contáctanos directamente.`,
    );
  }

  const startMinutes = parseTime(input.time);
  const manageToken = randomToken();

  const reservation = await db.transaction(async (tx) => {
    await lockDate(tx, input.date);

    const [reservations, blocks] = await Promise.all([
      occupyingReservations(tx, input.date),
      blocksBetween(tx, input.date, input.date),
    ]);
    const slots = slotsFor({
      date: input.date,
      partySize: input.partySize,
      settings,
      reservations,
      blocks,
      now: nowInTimezone(settings.timezone, now),
    });
    if (slots.length === 0) {
      throw new ReservationError("date_unavailable", "Esta fecha no está disponible para reservas online.");
    }
    const slot = slots.find((s) => s.minutes === startMinutes);
    if (!slot || slot.status !== "available") {
      throw new ReservationError("slot_unavailable", "Ese horario ya no está disponible. Elige otro, por favor.");
    }

    if (await findDuplicate(tx, input.date, input.email, input.phone.replace(/\D/g, ""))) {
      throw new ReservationError(
        "duplicate",
        "Ya existe una reserva activa con estos datos para ese día. Si necesitas cambiarla, usa el enlace de gestión o contáctanos.",
      );
    }

    return insertReservation(tx, {
      reference: reservationReference(),
      status: settings.confirmationMode === "auto" ? "confirmed" : "pending",
      date: input.date,
      startMinutes,
      durationMinutes: settings.reservationDurationMinutes,
      partySize: input.partySize,
      name: input.name,
      email: input.email,
      phone: input.phone,
      notes: input.notes ? input.notes : null,
      manageTokenHash: sha256(manageToken),
      idempotencyKey: input.idempotencyKey,
    });
  });

  return { reservation, manageToken, replayed: false };
}

/** Transiciones de estado permitidas desde el panel. */
export const TRANSITIONS: Record<"confirm" | "decline" | "cancel" | "complete" | "no_show", { from: ReservationStatus[]; to: ReservationStatus }> = {
  confirm: { from: ["pending"], to: "confirmed" },
  decline: { from: ["pending"], to: "declined" },
  cancel: { from: ["pending", "confirmed"], to: "cancelled" },
  complete: { from: ["confirmed"], to: "completed" },
  no_show: { from: ["confirmed"], to: "no_show" },
};

export async function changeReservationStatus(id: string, action: keyof typeof TRANSITIONS, actor: string): Promise<ReservationRecord> {
  const db = await getDb();
  const t = TRANSITIONS[action];
  const updated = await updateStatus(db, id, t.from, t.to, actor);
  if (!updated) throw new ReservationError("invalid_transition", "La reserva ya no está en un estado que permita esta acción.");
  return updated;
}

export async function getReservationByManageToken(token: string): Promise<ReservationRecord | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const db = await getDb();
  return findByManageTokenHash(db, sha256(token));
}

export async function cancelByManageToken(token: string): Promise<ReservationRecord> {
  const current = await getReservationByManageToken(token);
  if (!current) throw new ReservationError("not_found", "No encontramos esta reserva.");
  const db = await getDb();
  const settings = await getReservationSettings(db);
  if (minutesUntil(nowInTimezone(settings.timezone), current.date, current.startMinutes) <= 0) {
    throw new ReservationError("invalid_transition", "La hora de esta reserva ya ha pasado.");
  }
  const updated = await updateStatus(db, current.id, ["pending", "confirmed"], "cancelled", "customer");
  if (!updated) throw new ReservationError("invalid_transition", "Esta reserva ya no se puede cancelar.");
  return updated;
}
