"use client";

import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { formatDateLong } from "@/lib/reservations/time";

const WEEKDAYS = [
  ["L", "lunes"],
  ["M", "martes"],
  ["X", "miércoles"],
  ["J", "jueves"],
  ["V", "viernes"],
  ["S", "sábado"],
  ["D", "domingo"],
] as const;

interface CalendarProps {
  month: string; // YYYY-MM
  openDates: Record<string, boolean>;
  selected: string | null;
  loading: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (date: string) => void;
}

function monthMatrix(month: string): (string | null)[] {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7; // lunes = 0
  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= days; d++) cells.push(`${month}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function Calendar({ month, openDates, selected, loading, canPrev, canNext, onPrev, onNext, onSelect }: CalendarProps) {
  const [y, m] = month.split("-").map(Number);
  const title = new Intl.DateTimeFormat("es", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
  const cells = monthMatrix(month);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  return (
    <div className="rounded-xl border border-line bg-linen p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={onPrev} disabled={!canPrev} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand disabled:opacity-30" aria-label="Mes anterior">
          <ChevronLeft />
        </button>
        <p className="font-display text-xl first-letter:uppercase" aria-live="polite">
          {title}
        </p>
        <button type="button" onClick={onNext} disabled={!canNext} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand disabled:opacity-30" aria-label="Mes siguiente">
          <ChevronRight />
        </button>
      </div>
      <table className={`w-full table-fixed border-collapse transition-opacity ${loading ? "opacity-40" : ""}`} aria-busy={loading}>
        <caption className="sr-only">Selecciona una fecha de {title}. Los días no disponibles están desactivados.</caption>
        <thead>
          <tr>
            {WEEKDAYS.map(([short, long]) => (
              <th key={long} scope="col" className="pb-2 text-center text-xs font-semibold uppercase tracking-[0.1em] text-ink-mute">
                <abbr title={long} className="no-underline">
                  {short}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((date, di) => {
                if (!date) return <td key={di} />;
                const open = openDates[date] === true;
                const isSelected = selected === date;
                return (
                  <td key={date} className="p-0.5 text-center">
                    <button
                      type="button"
                      disabled={!open || loading}
                      onClick={() => onSelect(date)}
                      aria-pressed={isSelected}
                      aria-label={`${formatDateLong(date)}${open ? "" : ", no disponible"}`}
                      className={`mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-full text-[0.9375rem] tabular-nums transition-colors duration-200 ${
                        isSelected
                          ? "bg-terracotta font-semibold text-linen"
                          : open
                            ? "font-medium text-ink hover:bg-sand"
                            : "cursor-not-allowed text-ink/25 line-through decoration-ink/20"
                      }`}
                    >
                      {Number(date.slice(8))}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
