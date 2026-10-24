import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StatusActions } from "@/components/admin/StatusActions";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { isEmailConfigured } from "@/lib/email/provider";
import { listReservations, notificationsFor, type ReservationFilters } from "@/lib/reservations/repository";
import { STATUS_LABELS, type ReservationStatus } from "@/lib/reservations/request-schema";
import { getReservationSettings } from "@/lib/reservations/settings-store";
import { addDays, formatDateLong, isValidDate, nowInTimezone } from "@/lib/reservations/time";

export const metadata: Metadata = { title: "Reservas" };

type SearchParams = PageProps<"/admin">["searchParams"];

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: "bg-terracotta/12 text-terracotta",
  confirmed: "bg-success/12 text-success",
  declined: "bg-ink/8 text-ink-mute",
  cancelled: "bg-ink/8 text-ink-mute line-through",
  completed: "bg-olive/10 text-olive",
  no_show: "bg-danger/10 text-danger",
};

export default function AdminReservationsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-sand" />}>
      <Reservations searchParams={searchParams} />
    </Suspense>
  );
}

async function Reservations({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const db = await getDb();
  const settings = await getReservationSettings(db);
  const today = nowInTimezone(settings.timezone).date;

  const view = typeof sp.view === "string" ? sp.view : "day";
  const date = typeof sp.date === "string" && isValidDate(sp.date) ? sp.date : today;
  const status = (typeof sp.status === "string" ? sp.status : "active") as ReservationFilters["status"];
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";

  const filters: ReservationFilters =
    view === "upcoming" ? { date: today, dateTo: addDays(today, 30), status, q } : view === "pending" ? { status: "pending", q } : { date, status, q };
  const rows = await listReservations(db, filters);
  const logs = await notificationsFor(
    db,
    rows.map((r) => r.id),
  );

  const active = rows.filter((r) => r.status === "pending" || r.status === "confirmed");
  const covers = active.reduce((s, r) => s + r.partySize, 0);
  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const qs = (extra: Record<string, string>) => new URLSearchParams({ view, date, status: status ?? "active", ...(q ? { q } : {}), ...extra }).toString();

  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl">Reservas</h1>
          <p className="mt-2 text-ink-mute">
            Modo de confirmación: <strong className="text-ink">{settings.confirmationMode === "auto" ? "automática" : "manual"}</strong> · Capacidad simultánea:{" "}
            <strong className="text-ink">{settings.capacity.maxConcurrentCovers}</strong> comensales
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            { v: "day", label: "Por día" },
            { v: "upcoming", label: "Próximos 30 días" },
            { v: "pending", label: "Pendientes" },
          ].map((t) => (
            <Link
              key={t.v}
              href={`/admin?${qs({ view: t.v })}`}
              className={`rounded-full border px-4 py-2 font-medium ${view === t.v ? "border-ink bg-ink text-linen" : "border-line hover:bg-sand"}`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {!isEmailConfigured() && (
        <p role="note" className="mt-6 rounded-lg border border-dashed border-terracotta/60 bg-ivory px-4 py-3 text-sm text-ink-soft">
          <strong className="text-terracotta">Correo no configurado.</strong> Las reservas se guardan, pero no se envían emails a clientes ni al restaurante. Configura
          RESEND_API_KEY y EMAIL_FROM (ver README). Mientras tanto, contacta a los clientes por teléfono.
        </p>
      )}

      <form method="get" className="mt-8 grid gap-3 rounded-xl border border-line bg-ivory p-4 sm:grid-cols-2 lg:grid-cols-[auto_auto_1fr_auto]">
        <input type="hidden" name="view" value={view === "pending" ? "day" : view} />
        {view !== "upcoming" && (
          <label className="text-sm">
            <span className="field-label">Fecha</span>
            <input type="date" name="date" defaultValue={date} className="field-input !min-h-11 !py-2" />
          </label>
        )}
        <label className="text-sm">
          <span className="field-label">Estado</span>
          <select name="status" defaultValue={status} className="field-input !min-h-11 !py-2">
            <option value="active">Activas (pendientes y confirmadas)</option>
            <option value="all">Todas</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="field-label">Buscar</span>
          <input type="search" name="q" defaultValue={q} placeholder="Nombre, correo, teléfono o referencia" className="field-input !min-h-11 !py-2" />
        </label>
        <button type="submit" className="btn btn-primary self-end !min-h-11 !py-2">
          Filtrar
        </button>
      </form>

      <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-xl">
        <Stat label="Reservas" value={rows.length} />
        <Stat label="Comensales activos" value={covers} />
        <Stat label="Pendientes" value={pendingCount} highlight={pendingCount > 0} />
      </div>

      <h2 className="mt-10 font-display text-2xl first-letter:uppercase">
        {view === "day" ? formatDateLong(date) : view === "upcoming" ? "Próximos 30 días" : "Solicitudes pendientes"}
      </h2>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl border border-line bg-ivory p-8 text-center text-ink-mute">No hay reservas con estos filtros.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((r) => {
            const rLogs = logs.filter((l) => l.reservation_id === r.id);
            return (
              <li key={r.id} className="rounded-xl border border-line bg-ivory p-5">
                <div className="grid gap-4 lg:grid-cols-[9rem_1fr_auto] lg:items-start">
                  <div>
                    <p className="font-display text-3xl tabular-nums">{r.time}</p>
                    {view !== "day" && <p className="text-sm text-ink-mute first-letter:uppercase">{formatDateLong(r.date)}</p>}
                    <p className="mt-1 text-sm text-ink-mute">
                      {r.partySize} {r.partySize === 1 ? "persona" : "personas"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{r.name}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                      <span className="font-mono text-xs text-ink-mute">{r.reference}</span>
                    </div>
                    <p className="mt-1 flex flex-wrap gap-x-4 text-sm">
                      <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="link-underline">
                        {r.phone}
                      </a>
                      <a href={`mailto:${r.email}`} className="link-underline break-all">
                        {r.email}
                      </a>
                    </p>
                    {r.notes && <p className="mt-2 whitespace-pre-line rounded-lg bg-sand/60 px-3 py-2 text-sm">{r.notes}</p>}
                    {rLogs.length > 0 && (
                      <details className="mt-2 text-xs text-ink-mute">
                        <summary className="cursor-pointer">Notificaciones ({rLogs.length})</summary>
                        <ul className="mt-1 space-y-0.5">
                          {rLogs.map((l, i) => (
                            <li key={i}>
                              {l.event} → {l.recipient === "customer" ? "cliente" : "restaurante"}:{" "}
                              <strong className={l.status === "sent" ? "text-success" : l.status === "failed" ? "text-danger" : ""}>
                                {l.status === "sent" ? "enviado" : l.status === "failed" ? "fallido" : "no enviado"}
                              </strong>
                              {l.status !== "sent" && l.detail ? ` (${l.detail})` : ""}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                    <p className="mt-2 text-xs text-ink-mute">Recibida el {new Date(r.createdAt).toLocaleString("es", { timeZone: settings.timezone })}</p>
                  </div>
                  <StatusActions id={r.id} status={r.status} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-terracotta/40 bg-terracotta/5" : "border-line bg-ivory"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-mute">{label}</p>
      <p className="font-display mt-1 text-3xl tabular-nums">{value}</p>
    </div>
  );
}
