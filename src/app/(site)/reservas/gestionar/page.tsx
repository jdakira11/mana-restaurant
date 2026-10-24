import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { STATUS_LABELS } from "@/lib/reservations/request-schema";
import { getReservationByManageToken } from "@/lib/reservations/service";
import { formatDateLong } from "@/lib/reservations/time";
import { CancelForm } from "./CancelForm";

export const metadata: Metadata = {
  title: "Gestionar reserva",
  robots: { index: false, follow: false },
};

export default function ManageReservationPage({ searchParams }: PageProps<"/reservas/gestionar">) {
  return (
    <section className="container-x pb-24 pt-32 md:pb-36 md:pt-44">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Tu reserva</p>
        <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-xl bg-sand" />}>
          <ReservationDetails searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

async function ReservationDetails({ searchParams }: { searchParams: PageProps<"/reservas/gestionar">["searchParams"] }) {
  const { token } = await searchParams;
  // Datos personales consultados en cada petición: nunca se prerenderizan ni se cachean.
  await connection();
  const value = typeof token === "string" ? token : "";
  const reservation = value ? await getReservationByManageToken(value).catch(() => null) : null;

  if (!reservation) {
    return (
      <div className="mt-6">
        <h1 className="display-md">No encontramos esta reserva</h1>
        <p className="mt-4 text-lg text-ink-soft">El enlace no es válido o ha caducado. Si necesitas ayuda, contacta con el restaurante.</p>
        <Link href="/#reservas" className="btn btn-primary mt-8">
          Hacer una reserva
        </Link>
      </div>
    );
  }

  const active = reservation.status === "pending" || reservation.status === "confirmed";
  return (
    <div className="mt-6">
      <h1 className="display-md">Hola, {reservation.name.split(" ")[0]}</h1>
      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6">
        <div className="col-span-2">
          <dt className="field-label">Estado</dt>
          <dd className="text-lg font-semibold">{STATUS_LABELS[reservation.status]}</dd>
        </div>
        <div className="col-span-2">
          <dt className="field-label">Fecha</dt>
          <dd className="font-display text-xl first-letter:uppercase">{formatDateLong(reservation.date)}</dd>
        </div>
        <div>
          <dt className="field-label">Hora</dt>
          <dd className="font-display text-xl">{reservation.time}</dd>
        </div>
        <div>
          <dt className="field-label">Personas</dt>
          <dd className="font-display text-xl">{reservation.partySize}</dd>
        </div>
        <div className="col-span-2">
          <dt className="field-label">Referencia</dt>
          <dd className="font-mono text-lg tracking-wider">{reservation.reference}</dd>
        </div>
      </dl>
      <div className="mt-8">{active ? <CancelForm token={value} /> : <p className="text-ink-soft">Esta reserva ya no está activa.</p>}</div>
    </div>
  );
}
