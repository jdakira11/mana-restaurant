"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Calendar } from "./Calendar";
import { ReservationConfirmation } from "./ReservationConfirmation";
import { ArrowRight, Minus, Plus } from "@/components/ui/icons";
import { reservationRequestSchema, type ReservationReceipt } from "@/lib/reservations/request-schema";
import type { PublicReservationSettings } from "@/lib/reservations/settings-schema";
import { addDays, formatDateLong } from "@/lib/reservations/time";

interface SlotView {
  time: string;
  service: string;
  available: boolean;
  reason: "available" | "full" | "too_soon" | "blocked";
}

type Fields = { name: string; email: string; phone: string; notes: string; privacy: boolean };
type FieldKey = keyof Fields | "partySize" | "date" | "time";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const FIELD_ORDER: FieldKey[] = ["partySize", "date", "time", "name", "email", "phone", "notes", "privacy"];

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

const subscribeNever = () => () => {};
function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function ReservationForm({ contactHint }: { contactHint?: string }) {
  const [settings, setSettings] = useState<PublicReservationSettings | null>(null);
  const [today, setToday] = useState<string | null>(null);
  // El mes inicial se calcula en el navegador (en el prerenderizado sería el mes del build).
  const clientMonth = useSyncExternalStore(subscribeNever, currentMonth, () => null);
  const [monthOverride, setMonth] = useState<string | null>(null);
  const month = monthOverride ?? clientMonth;
  const [reloadToken, setReloadToken] = useState(0);
  const [monthData, setMonthData] = useState<{ key: string; openDates: Record<string, boolean>; error: string | null } | null>(null);
  const monthKey = month ? `${month}#${reloadToken}` : null;
  const monthLoading = monthData?.key !== monthKey;
  const openDates = monthData?.openDates ?? {};
  const monthError = !monthLoading ? (monthData?.error ?? null) : null;

  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState<string | null>(null);
  const [slotsReload, setSlotsReload] = useState(0);
  const [slotsData, setSlotsData] = useState<{ key: string; slots: SlotView[] | null; error: string | null } | null>(null);
  const slotsKey = date ? `${date}#${partySize}#${slotsReload}` : null;
  const slotsLoading = slotsKey !== null && slotsData?.key !== slotsKey;
  const slots = date ? (slotsData?.slots ?? null) : null;
  const slotsError = !slotsLoading ? (slotsData?.error ?? null) : null;
  const [time, setTime] = useState<string | null>(null);

  const [fields, setFields] = useState<Fields>({ name: "", email: "", phone: "", notes: "", privacy: false });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ReservationReceipt | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(0);
  const idempotencyKey = useRef<string | null>(null);

  // Marca de tiempo anti-bots: momento en que el formulario se mostró en el navegador.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Días abiertos del mes visible. El estado solo se actualiza al llegar la respuesta.
  useEffect(() => {
    if (!month || !monthKey) return;
    const controller = new AbortController();
    fetch(`/api/availability?from=${month}-01&days=${daysInMonth(month)}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error");
        const dates = data.dates as { date: string; open: boolean }[];
        setSettings(data.settings);
        setToday(data.today);
        setMonthData({ key: monthKey, openDates: Object.fromEntries(dates.map((d) => [d.date, d.open])), error: null });
        // Si en el mes actual ya no quedan días disponibles, pasar al siguiente.
        const maxMonth = addDays(data.today, data.settings.maxDaysAhead).slice(0, 7);
        if (!dates.some((d) => d.open) && month < maxMonth && month === data.today.slice(0, 7)) setMonth(shiftMonth(month, 1));
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setMonthData({
          key: monthKey,
          openDates: {},
          error: err instanceof Error && err.message !== "Error" ? err.message : "No hemos podido cargar el calendario.",
        });
      });
    return () => controller.abort();
  }, [month, monthKey]);

  // Horarios del día elegido para el número de personas.
  useEffect(() => {
    if (!date || !slotsKey) return;
    const controller = new AbortController();
    fetch(`/api/availability?date=${date}&party=${partySize}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error");
        const list = data.slots as SlotView[];
        setSlotsData({ key: slotsKey, slots: list, error: null });
        setTime((t) => (t && list.some((s) => s.time === t && s.available) ? t : null));
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setSlotsData({
          key: slotsKey,
          slots: null,
          error: err instanceof Error && err.message !== "Error" ? err.message : "No hemos podido cargar los horarios.",
        });
      });
    return () => controller.abort();
  }, [date, partySize, slotsKey]);

  const loadSlots = () => setSlotsReload((n) => n + 1);

  const grouped = useMemo(() => {
    const map = new Map<string, SlotView[]>();
    for (const s of slots ?? []) map.set(s.service, [...(map.get(s.service) ?? []), s]);
    return Array.from(map.entries());
  }, [slots]);

  const minParty = settings?.partySize.min ?? 1;
  const maxParty = settings?.partySize.max ?? 10;
  const maxMonth = today && settings ? addDays(today, settings.maxDaysAhead).slice(0, 7) : null;
  const visibleSlots = (slots ?? []).filter((s) => s.reason !== "too_soon");
  const noneAvailable = slots !== null && !slotsLoading && !slots.some((s) => s.available);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function focusField(key: FieldKey) {
    const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${key}"]`);
    el?.focus();
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    idempotencyKey.current ??= crypto.randomUUID();
    const formData = new FormData(e.currentTarget);
    const payload = {
      ...fields,
      partySize,
      date: date ?? "",
      time: time ?? "",
      idempotencyKey: idempotencyKey.current,
      website: String(formData.get("website") ?? ""),
      startedAt: startedAt.current,
      turnstileToken: (formData.get("cf-turnstile-response") as string | null) ?? undefined,
    };

    const parsed = reservationRequestSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Partial<Record<FieldKey, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldKey;
        if (FIELD_ORDER.includes(key)) next[key] ??= issue.message;
      }
      setErrors(next);
      const first = FIELD_ORDER.find((k) => next[k]);
      setFormError("Revisa los campos marcados para completar la reserva.");
      if (first) focusField(first);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.reservation) {
        setReceipt(data.reservation);
        idempotencyKey.current = null;
        requestAnimationFrame(() => document.getElementById("reserva-confirmacion")?.focus());
        return;
      }
      if (res.status === 422 && data.fieldErrors) {
        setErrors(data.fieldErrors);
        const first = FIELD_ORDER.find((k) => data.fieldErrors[k]);
        if (first) focusField(first);
      }
      if (res.status === 409 && data.code === "slot_unavailable") {
        setTime(null);
        loadSlots();
      }
      setFormError(data.error ?? "No hemos podido enviar la solicitud. Inténtalo de nuevo.");
    } catch {
      setFormError("Parece que hay un problema de conexión. Comprueba tu red e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setReceipt(null);
    setDate(null);
    setTime(null);
    setFields((f) => ({ ...f, notes: "", privacy: false }));
    startedAt.current = Date.now();
    setReloadToken((t) => t + 1);
  }

  if (receipt) return <ReservationConfirmation receipt={receipt} onNew={resetForm} />;

  const errorId = (k: FieldKey) => (errors[k] ? `err-${k}` : undefined);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-10" aria-describedby={formError ? "form-error" : undefined}>
      {/* 1 · Comensales */}
      <fieldset>
        <legend className="field-label !mb-3">1 · Número de personas</legend>
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center rounded-full border border-line bg-linen p-1">
            <button
              type="button"
              onClick={() => setPartySize((n) => Math.max(minParty, n - 1))}
              disabled={partySize <= minParty}
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand disabled:opacity-30"
              aria-label="Una persona menos"
            >
              <Minus />
            </button>
            <output data-field="partySize" tabIndex={-1} aria-live="polite" className="font-display w-28 text-center text-2xl tabular-nums">
              {partySize} <span className="font-sans text-sm text-ink-mute">{partySize === 1 ? "persona" : "personas"}</span>
            </output>
            <button
              type="button"
              onClick={() => setPartySize((n) => Math.min(maxParty, n + 1))}
              disabled={partySize >= maxParty}
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand disabled:opacity-30"
              aria-label="Una persona más"
            >
              <Plus />
            </button>
          </div>
          {partySize >= maxParty && (
            <p className="text-sm text-ink-mute">
              ¿Más de {maxParty} personas? {contactHint ?? "Contáctanos directamente para grupos."}
            </p>
          )}
        </div>
      </fieldset>

      {/* 2 · Fecha */}
      <fieldset>
        <legend className="field-label !mb-3">2 · Fecha</legend>
        {monthError ? (
          <div role="alert" className="rounded-xl border border-danger/30 bg-linen p-5 text-sm">
            <p className="text-danger">{monthError}</p>
            <button type="button" className="link-underline mt-2 font-semibold" onClick={() => setReloadToken((t) => t + 1)}>
              Reintentar
            </button>
          </div>
        ) : month ? (
          <div data-field="date" tabIndex={-1} className="outline-none">
            <Calendar
              month={month}
              openDates={openDates}
              selected={date}
              loading={monthLoading}
              canPrev={!!today && month > today.slice(0, 7)}
              canNext={!!maxMonth && month < maxMonth}
              onPrev={() => setMonth(shiftMonth(month, -1))}
              onNext={() => setMonth(shiftMonth(month, 1))}
              onSelect={(d) => {
                setDate(d);
                setErrors((e) => ({ ...e, date: undefined }));
              }}
            />
          </div>
        ) : (
          <div className="h-80 animate-pulse rounded-xl bg-linen" aria-hidden />
        )}
        {errors.date && (
          <p id={errorId("date")} className="field-error">
            {errors.date}
          </p>
        )}
      </fieldset>

      {/* 3 · Hora */}
      <fieldset aria-describedby={errorId("time")}>
        <legend className="field-label !mb-3">3 · Hora {date && <span className="font-normal normal-case tracking-normal text-ink-mute">— {formatDateLong(date)}</span>}</legend>
        <div data-field="time" tabIndex={-1} className="outline-none" aria-live="polite" aria-busy={slotsLoading}>
          {!date && <p className="text-[0.9375rem] text-ink-mute">Elige primero una fecha para ver los horarios disponibles.</p>}
          {date && slotsLoading && !slots && (
            <div className="flex flex-wrap gap-2" aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="h-11 w-20 animate-pulse rounded-full bg-linen" />
              ))}
            </div>
          )}
          {date && slotsError && (
            <p role="alert" className="text-sm text-danger">
              {slotsError}{" "}
              <button type="button" className="link-underline font-semibold" onClick={() => loadSlots()}>
                Reintentar
              </button>
            </p>
          )}
          {date && slots && !slotsError && (
            <div className={`space-y-5 transition-opacity ${slotsLoading ? "opacity-50" : ""}`}>
              {noneAvailable ? (
                <p className="text-[0.9375rem] text-ink-soft">
                  No quedan horarios disponibles para {partySize} {partySize === 1 ? "persona" : "personas"} este día. Prueba con otra fecha.
                </p>
              ) : (
                grouped.map(([service, list]) => {
                  const shown = list.filter((s) => visibleSlots.includes(s));
                  if (shown.length === 0) return null;
                  return (
                    <div key={service}>
                      <p className="mb-2 text-sm font-medium text-ink-mute">{service}</p>
                      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Horarios de ${service}`}>
                        {shown.map((s) => {
                          const selected = time === s.time;
                          return (
                            <button
                              key={s.time}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              disabled={!s.available}
                              onClick={() => {
                                setTime(s.time);
                                setErrors((e) => ({ ...e, time: undefined }));
                              }}
                              className={`h-11 min-w-[5.25rem] rounded-full border px-4 text-[0.9375rem] tabular-nums transition-colors duration-200 ${
                                selected
                                  ? "border-terracotta bg-terracotta font-semibold text-linen"
                                  : s.available
                                    ? "border-line bg-linen hover:border-ink"
                                    : "cursor-not-allowed border-transparent bg-transparent text-ink/30 line-through"
                              }`}
                              aria-label={s.available ? s.time : `${s.time}, completo`}
                            >
                              {s.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        {errors.time && (
          <p id={errorId("time")} className="field-error">
            {errors.time}
          </p>
        )}
      </fieldset>

      {/* 4 · Datos */}
      <fieldset className="space-y-5">
        <legend className="field-label !mb-3">4 · Tus datos</legend>
        <div>
          <label htmlFor="res-name" className="field-label">
            Nombre y apellido
          </label>
          <input
            id="res-name"
            data-field="name"
            className="field-input"
            autoComplete="name"
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errorId("name")}
            required
            maxLength={80}
          />
          {errors.name && (
            <p id="err-name" className="field-error">
              {errors.name}
            </p>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="res-email" className="field-label">
              Correo electrónico
            </label>
            <input
              id="res-email"
              data-field="email"
              type="email"
              inputMode="email"
              className="field-input"
              autoComplete="email"
              value={fields.email}
              onChange={(e) => update("email", e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errorId("email")}
              required
              maxLength={160}
            />
            {errors.email && (
              <p id="err-email" className="field-error">
                {errors.email}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="res-phone" className="field-label">
              Teléfono
            </label>
            <input
              id="res-phone"
              data-field="phone"
              type="tel"
              inputMode="tel"
              className="field-input"
              autoComplete="tel"
              value={fields.phone}
              onChange={(e) => update("phone", e.target.value)}
              aria-invalid={!!errors.phone}
              aria-describedby={errorId("phone")}
              required
              maxLength={22}
            />
            {errors.phone && (
              <p id="err-phone" className="field-error">
                {errors.phone}
              </p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="res-notes" className="field-label">
            Comentarios <span className="font-normal normal-case tracking-normal text-ink-mute">(opcional)</span>
          </label>
          <textarea
            id="res-notes"
            data-field="notes"
            className="field-input min-h-28 resize-y"
            placeholder="Alergias, celebraciones, necesidades de accesibilidad…"
            value={fields.notes}
            onChange={(e) => update("notes", e.target.value)}
            aria-invalid={!!errors.notes}
            aria-describedby={errorId("notes") ?? "notes-help"}
            maxLength={500}
          />
          <p id="notes-help" className="mt-1 text-right text-xs text-ink-mute">
            {fields.notes.length}/500
          </p>
          {errors.notes && (
            <p id="err-notes" className="field-error">
              {errors.notes}
            </p>
          )}
        </div>

        {/* Campo trampa para bots: oculto a personas y lectores de pantalla */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="res-website">No rellenes este campo</label>
          <input id="res-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-relaxed text-ink-soft">
            <input
              type="checkbox"
              data-field="privacy"
              checked={fields.privacy}
              onChange={(e) => update("privacy", e.target.checked)}
              aria-invalid={!!errors.privacy}
              aria-describedby={errorId("privacy")}
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-terracotta)]"
            />
            <span>
              He leído y acepto la{" "}
              <a href="/privacidad" target="_blank" className="font-medium text-terracotta underline underline-offset-4">
                política de privacidad
              </a>
              . Usaremos tus datos solo para gestionar esta reserva.
            </span>
          </label>
          {errors.privacy && (
            <p id="err-privacy" className="field-error">
              {errors.privacy}
            </p>
          )}
        </div>

        {TURNSTILE_SITE_KEY && (
          <>
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
            <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-language="es" />
          </>
        )}
      </fieldset>

      {formError && (
        <div id="form-error" role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[0.9375rem] text-danger">
          {formError}
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-mute">
          {settings?.confirmationMode === "auto"
            ? "Si hay disponibilidad, tu reserva quedará confirmada al instante."
            : "Recibirás una respuesta del restaurante para confirmar tu reserva."}
        </p>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-linen/40 border-t-linen" aria-hidden />
              Enviando…
            </>
          ) : (
            <>
              {settings?.confirmationMode === "auto" ? "Reservar mesa" : "Solicitar reserva"}
              <ArrowRight className="btn-arrow" width={18} height={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
