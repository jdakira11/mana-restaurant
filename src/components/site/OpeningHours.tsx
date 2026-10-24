"use client";

import { useEffect, useState } from "react";
import { defaultReservationSettings } from "@/config/reservations";
import { siteConfig } from "@/config/site";
import { summarizeWeeklySchedule } from "@/lib/reservations/hours";
import type { TimeWindow } from "@/lib/reservations/settings-schema";

/**
 * Horario de apertura. Se muestra primero el de `config/reservations.ts` y se actualiza con
 * el vigente en el sistema (que puede haberse cambiado desde el panel).
 */
export function OpeningHours({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const [schedule, setSchedule] = useState<TimeWindow[][]>(defaultReservationSettings.weeklySchedule);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/hours", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.weeklySchedule && setSchedule(data.weeklySchedule))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const rows = summarizeWeeklySchedule(schedule);
  return (
    <div className={className}>
      <dl className={compact ? "space-y-1" : "space-y-2"}>
        {rows.map((r) => (
          <div key={r.days} className="flex flex-wrap justify-between gap-x-6">
            <dt>{r.days}</dt>
            <dd className={`tabular-nums ${r.hours === "Cerrado" ? "opacity-60" : ""}`}>{r.hours}</dd>
          </div>
        ))}
      </dl>
      {!siteConfig.contentStatus.hours && siteConfig.showContentNotices && (
        <p className="mt-3 text-xs italic opacity-70">Horario provisional, pendiente de confirmación.</p>
      )}
    </div>
  );
}
