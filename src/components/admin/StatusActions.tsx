"use client";

import { useActionState } from "react";
import { changeStatusAction, type FormState } from "@/app/admin/actions";
import type { ReservationStatus } from "@/lib/reservations/request-schema";

const ACTIONS: { action: string; label: string; from: ReservationStatus[]; tone: "primary" | "ghost" | "danger"; confirm?: string }[] = [
  { action: "confirm", label: "Confirmar", from: ["pending"], tone: "primary" },
  { action: "decline", label: "Rechazar", from: ["pending"], tone: "danger", confirm: "¿Rechazar esta solicitud? Se avisará al cliente." },
  { action: "complete", label: "Completada", from: ["confirmed"], tone: "ghost" },
  { action: "no_show", label: "No se presentó", from: ["confirmed"], tone: "ghost" },
  { action: "cancel", label: "Cancelar", from: ["pending", "confirmed"], tone: "danger", confirm: "¿Cancelar esta reserva? Se avisará al cliente." },
];

export function StatusActions({ id, status }: { id: string; status: ReservationStatus }) {
  const [state, action, pending] = useActionState<FormState, FormData>(changeStatusAction, { ok: false, message: null });
  const available = ACTIONS.filter((a) => a.from.includes(status));
  if (available.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {available.map((a) => (
          <form
            key={a.action}
            action={action}
            onSubmit={(e) => {
              if (a.confirm && !window.confirm(a.confirm)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="action" value={a.action} />
            <button
              type="submit"
              disabled={pending}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                a.tone === "primary"
                  ? "bg-success text-linen hover:bg-ink"
                  : a.tone === "danger"
                    ? "border border-danger/40 text-danger hover:bg-danger hover:text-linen"
                    : "border border-line hover:bg-sand"
              }`}
            >
              {a.label}
            </button>
          </form>
        ))}
      </div>
      {state.message && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {state.message}
        </p>
      )}
    </div>
  );
}
