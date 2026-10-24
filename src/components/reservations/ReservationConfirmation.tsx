"use client";

import { Check, Clock } from "@/components/ui/icons";
import type { ReservationReceipt } from "@/lib/reservations/request-schema";
import { formatDateLong } from "@/lib/reservations/time";

export function ReservationConfirmation({ receipt, onNew }: { receipt: ReservationReceipt; onNew: () => void }) {
  const confirmed = receipt.status === "confirmed";
  const firstName = receipt.name.split(" ")[0];

  return (
    <div id="reserva-confirmacion" tabIndex={-1} role="status" className="outline-none" style={{ animation: "fade .7s ease both" }}>
      <div className={`flex h-14 w-14 items-center justify-center rounded-full ${confirmed ? "bg-success text-linen" : "bg-brass/20 text-terracotta"}`}>
        {confirmed ? <Check width={28} height={28} /> : <Clock width={28} height={28} />}
      </div>
      {receipt.demo && (
        <p role="note" className="mt-6 rounded-lg border border-dashed border-terracotta/60 bg-linen px-4 py-3 text-sm text-ink-soft">
          <strong className="text-terracotta">Reserva de demostración.</strong> Así verá el cliente su confirmación. En esta vista previa no se ha guardado ni
          enviado nada.
        </p>
      )}
      <p className="eyebrow mt-8">{confirmed ? "Reserva confirmada" : "Solicitud recibida"}</p>
      <h3 className="font-script mt-4 text-[clamp(2.8rem,5vw,3.8rem)] leading-tight">
        {confirmed ? `Te esperamos, ${firstName}.` : `Gracias, ${firstName}.`}
      </h3>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-soft">
        {confirmed
          ? "Tu mesa está reservada. Hemos comprobado la disponibilidad y la reserva ha quedado confirmada."
          : "Tu solicitud está pendiente de confirmación. El restaurante la revisará y te comunicará si queda confirmada. Todavía no es una reserva confirmada."}
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-4">
          <dt className="field-label">Estado</dt>
          <dd>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
                confirmed ? "bg-success/10 text-success" : "bg-terracotta/10 text-terracotta"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${confirmed ? "bg-success" : "bg-terracotta"}`} aria-hidden />
              {confirmed ? "Confirmada" : "Pendiente de confirmación"}
            </span>
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="field-label">Fecha</dt>
          <dd className="font-display text-xl first-letter:uppercase">{formatDateLong(receipt.date)}</dd>
        </div>
        <div>
          <dt className="field-label">Hora</dt>
          <dd className="font-display text-xl tabular-nums">{receipt.time}</dd>
        </div>
        <div>
          <dt className="field-label">Personas</dt>
          <dd className="font-display text-xl">{receipt.partySize}</dd>
        </div>
        <div className="col-span-2 sm:col-span-4">
          <dt className="field-label">Referencia</dt>
          <dd className="font-mono text-lg tracking-wider">{receipt.reference}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <p className="field-label">Próximos pasos</p>
        <ul className="mt-3 space-y-2 text-[0.9375rem] leading-relaxed text-ink-soft">
          {confirmed ? (
            <>
              {receipt.emailNotifications && <li>Te enviaremos un correo electrónico con los detalles de tu reserva.</li>}
              <li>Si no puedes venir, cancélala desde el enlace de gestión para liberar la mesa.</li>
            </>
          ) : (
            <>
              <li>El equipo del restaurante revisará tu solicitud.</li>
              <li>
                {receipt.emailNotifications
                  ? "Te avisaremos por correo electrónico cuando quede confirmada o si no hay disponibilidad."
                  : "El restaurante se pondrá en contacto contigo para confirmarla. También puedes consultar su estado en el enlace de gestión."}
              </li>
            </>
          )}
          <li>Guarda tu referencia{receipt.manageUrl ? " y el enlace de gestión" : ""}: te servirán para cualquier consulta.</li>
        </ul>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        {receipt.manageUrl && (
          <a href={receipt.manageUrl} className="btn btn-ghost">
            Ver o cancelar mi reserva
          </a>
        )}
        <button type="button" onClick={onNew} className="btn text-ink-soft hover:text-ink">
          Hacer otra reserva
        </button>
      </div>
    </div>
  );
}
