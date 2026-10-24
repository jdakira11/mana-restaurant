"use client";

import { useActionState, useState } from "react";
import { cancelReservationAction, type CancelState } from "./actions";

export function CancelForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<CancelState, FormData>(cancelReservationAction, { ok: false, message: null });
  const [confirming, setConfirming] = useState(false);

  if (state.ok) {
    return (
      <p role="status" className="rounded-lg bg-success/10 px-4 py-3 font-medium text-success">
        {state.message} Si cambias de opinión, puedes hacer una nueva reserva.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.message && (
        <p role="alert" className="text-danger">
          {state.message}
        </p>
      )}
      {!confirming ? (
        <button type="button" className="btn btn-ghost" onClick={() => setConfirming(true)}>
          Cancelar mi reserva
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="w-full text-ink-soft">¿Seguro que quieres cancelar? Esta acción no se puede deshacer.</p>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Cancelando…" : "Sí, cancelar la reserva"}
          </button>
          <button type="button" className="btn text-ink-soft" onClick={() => setConfirming(false)} disabled={pending}>
            No, mantenerla
          </button>
        </div>
      )}
    </form>
  );
}
