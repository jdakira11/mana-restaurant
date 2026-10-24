"use client";

import { useActionState } from "react";
import { resetSettingsAction, saveSettingsAction, type FormState } from "@/app/admin/actions";
import type { ReservationSettings, TimeWindow } from "@/lib/reservations/settings-schema";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

const windowsToText = (ws: TimeWindow[]) => (ws.length === 0 ? "cerrado" : ws.map((w) => `${w.start}-${w.end}${w.label ? ` ${w.label}` : ""}`).join(", "));

function NumberField({
  name,
  label,
  value,
  help,
  min = 0,
  optional,
}: {
  name: string;
  label: string;
  value: number | null;
  help?: string;
  min?: number;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input type="number" name={name} defaultValue={value ?? ""} min={min} required={!optional} className="field-input !min-h-11 !py-2" />
      {help && <span className="mt-1 block text-xs text-ink-mute">{help}</span>}
    </label>
  );
}

export function SettingsForm({ settings }: { settings: ReservationSettings }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettingsAction, { ok: false, message: null });
  const [resetState, resetAction, resetting] = useActionState<FormState>(resetSettingsAction, { ok: false, message: null });
  const overridesText = settings.dateOverrides
    .map((o) => `${o.date} ${o.closed ? `cerrado${o.note ? ` ${o.note}` : ""}` : windowsToText(o.windows ?? [])}`)
    .join("\n");
  // Los campos no están controlados: al cambiar los ajustes guardados se remonta el formulario
  // para que muestre los valores vigentes.
  const version = JSON.stringify(settings);

  return (
    <>
      <form key={version} action={action} className="space-y-10">
        <section className="rounded-xl border border-line bg-ivory p-5 md:p-6">
          <h2 className="font-display text-2xl">Confirmación</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { v: "manual", t: "Manual", d: "Las solicitudes quedan pendientes hasta que el equipo las confirma desde este panel." },
              { v: "auto", t: "Automática", d: "Se confirman al instante si hay disponibilidad según la capacidad configurada." },
            ].map((o) => (
              <label key={o.v} className="flex cursor-pointer gap-3 rounded-lg border border-line bg-linen p-4 has-[:checked]:border-terracotta">
                <input
                  type="radio"
                  name="confirmationMode"
                  value={o.v}
                  defaultChecked={settings.confirmationMode === o.v}
                  className="mt-1 accent-[var(--color-terracotta)]"
                />
                <span>
                  <span className="font-semibold">{o.t}</span>
                  <span className="mt-1 block text-sm text-ink-mute">{o.d}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-ivory p-5 md:p-6">
          <h2 className="font-display text-2xl">Capacidad y turnos</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField
              name="maxConcurrentCovers"
              label="Comensales simultáneos (máx.)"
              value={settings.capacity.maxConcurrentCovers}
              min={1}
              help="Total de personas sentadas a la vez."
            />
            <NumberField
              name="maxCoversPerArrival"
              label="Llegadas por horario (máx.)"
              value={settings.capacity.maxCoversPerArrival}
              min={1}
              optional
              help="Déjalo vacío para no limitar."
            />
            <NumberField name="slotIntervalMinutes" label="Intervalo entre horarios (min)" value={settings.slotIntervalMinutes} min={5} />
            <NumberField name="reservationDurationMinutes" label="Duración de cada reserva (min)" value={settings.reservationDurationMinutes} min={15} />
            <NumberField name="lastArrivalBeforeCloseMinutes" label="Última llegada antes del cierre (min)" value={settings.lastArrivalBeforeCloseMinutes} />
            <NumberField name="partyMin" label="Personas por reserva (mín.)" value={settings.partySize.min} min={1} />
            <NumberField name="partyMax" label="Personas por reserva online (máx.)" value={settings.partySize.max} min={1} />
            <NumberField name="minNoticeMinutes" label="Antelación mínima (min)" value={settings.minNoticeMinutes} />
            <NumberField name="maxDaysAhead" label="Reservar con hasta (días)" value={settings.maxDaysAhead} min={1} />
          </div>
          <label className="mt-5 block max-w-sm">
            <span className="field-label">Zona horaria del restaurante</span>
            <input name="timezone" defaultValue={settings.timezone} required className="field-input !min-h-11 !py-2" />
            <span className="mt-1 block text-xs text-ink-mute">Formato IANA, p. ej. America/Santiago, America/Bogota, Europe/Madrid.</span>
          </label>
        </section>

        <section className="rounded-xl border border-line bg-ivory p-5 md:p-6">
          <h2 className="font-display text-2xl">Horario semanal de reservas</h2>
          <p className="mt-1 text-sm text-ink-mute">
            Una o varias franjas separadas por comas, con nombre opcional: <code>13:00-16:30 Mediodía, 19:30-23:30 Noche</code>. Escribe <code>cerrado</code> si
            no abre. Hora máxima 24:00.
          </p>
          <div className="mt-4 grid gap-3">
            {ORDER.map((i) => (
              <label key={i} className="grid items-center gap-2 sm:grid-cols-[8rem_1fr]">
                <span className="text-sm font-semibold">{DAYS[i]}</span>
                <input name={`day${i}`} defaultValue={windowsToText(settings.weeklySchedule[i] ?? [])} className="field-input !min-h-11 !py-2" />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-ivory p-5 md:p-6">
          <h2 className="font-display text-2xl">Cierres y horarios especiales</h2>
          <p className="mt-1 text-sm text-ink-mute">
            Una línea por fecha: <code>2026-12-25 cerrado Navidad</code> o <code>2026-12-31 20:00-24:00 Cena especial</code>.
          </p>
          <textarea name="dateOverrides" defaultValue={overridesText} rows={5} className="field-input mt-4 font-mono text-sm" />
        </section>

        {state.message && (
          <p
            role={state.ok ? "status" : "alert"}
            className={`rounded-lg px-4 py-3 text-sm ${state.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
          >
            {state.message}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={pending || resetting}>
          {pending ? "Guardando…" : "Guardar ajustes"}
        </button>
      </form>

      <form
        action={resetAction}
        className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-8"
        onSubmit={(e) => {
          if (!window.confirm("¿Restaurar los valores definidos en config/reservations.ts?")) e.preventDefault();
        }}
      >
        <button type="submit" data-action="reset-settings" className="btn btn-ghost" disabled={pending || resetting}>
          {resetting ? "Restaurando…" : "Restaurar valores del código"}
        </button>
        {resetState.message && (
          <p role="status" className="text-sm text-success">
            {resetState.message}
          </p>
        )}
      </form>
    </>
  );
}
