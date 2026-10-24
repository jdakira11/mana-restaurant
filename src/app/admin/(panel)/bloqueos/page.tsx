import type { Metadata } from "next";
import { Suspense } from "react";
import { deleteBlockAction } from "../../actions";
import { BlockForm } from "@/components/admin/BlockForm";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getReservationSettings } from "@/lib/reservations/settings-store";
import { formatDateLong, formatTime, nowInTimezone } from "@/lib/reservations/time";

export const metadata: Metadata = { title: "Bloqueos" };

export default function BlocksPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-sand" />}>
      <Blocks />
    </Suspense>
  );
}

async function Blocks() {
  await requireAdmin();
  const db = await getDb();
  const settings = await getReservationSettings(db);
  const today = nowInTimezone(settings.timezone).date;
  const { rows } = await db.query<{ id: string; block_date: string; start_minutes: number | null; end_minutes: number | null; reason: string | null }>(
    `select id, block_date::text as block_date, start_minutes, end_minutes, reason from reservation_blocks
     where block_date >= $1 order by block_date, start_minutes nulls first`,
    [today],
  );

  return (
    <div>
      <h1 className="text-4xl">Bloqueos de fechas y horarios</h1>
      <p className="mt-2 max-w-2xl text-ink-mute">
        Cierra un día completo o una franja (eventos privados, vacaciones, mantenimiento). Los horarios bloqueados dejan de ofrecerse en la web al momento. Para
        cierres recurrentes o horarios especiales, usa <a href="/admin/ajustes" className="link-underline text-ink">Ajustes</a>.
      </p>
      <div className="mt-8">
        <BlockForm today={today} />
      </div>
      <h2 className="mt-12 font-display text-2xl">Próximos bloqueos</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-ink-mute">No hay bloqueos programados.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-ivory">
          {rows.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium first-letter:uppercase">{formatDateLong(b.block_date)}</p>
                <p className="text-sm text-ink-mute">
                  {b.start_minutes === null ? "Todo el día" : `${formatTime(b.start_minutes)} – ${formatTime(b.end_minutes!)}`}
                  {b.reason ? ` · ${b.reason}` : ""}
                </p>
              </div>
              <form action={deleteBlockAction}>
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" className="rounded-full border border-line px-3.5 py-1.5 text-sm hover:bg-sand">
                  Quitar bloqueo
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
