"use client";

import { useActionState, useState } from "react";
import { createBlockAction, type FormState } from "@/app/admin/actions";

export function BlockForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createBlockAction, { ok: false, message: null });
  const [allDay, setAllDay] = useState(true);
  return (
    <form action={action} className="grid gap-4 rounded-xl border border-line bg-ivory p-5 sm:grid-cols-2 lg:grid-cols-[auto_auto_auto_auto_1fr_auto] lg:items-end">
      <label>
        <span className="field-label">Fecha</span>
        <input type="date" name="date" min={today} required className="field-input !min-h-11 !py-2" />
      </label>
      <label className="flex items-center gap-2 pb-3 text-sm font-medium">
        <input type="checkbox" name="allDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-5 w-5 accent-[var(--color-terracotta)]" />
        Todo el día
      </label>
      <label>
        <span className="field-label">Desde</span>
        <input type="time" name="start" disabled={allDay} step={900} className="field-input !min-h-11 !py-2 disabled:opacity-40" />
      </label>
      <label>
        <span className="field-label">Hasta</span>
        <input type="time" name="end" disabled={allDay} step={900} className="field-input !min-h-11 !py-2 disabled:opacity-40" />
      </label>
      <label>
        <span className="field-label">Motivo (interno)</span>
        <input type="text" name="reason" maxLength={120} placeholder="Evento privado, cierre…" className="field-input !min-h-11 !py-2" />
      </label>
      <button type="submit" className="btn btn-primary !min-h-11 !py-2" disabled={pending}>
        {pending ? "Guardando…" : "Bloquear"}
      </button>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`text-sm sm:col-span-2 lg:col-span-6 ${state.ok ? "text-success" : "text-danger"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
