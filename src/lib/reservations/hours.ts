import type { TimeWindow } from "./settings-schema";

const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
// Orden de presentación: lunes → domingo
const ORDER = [1, 2, 3, 4, 5, 6, 0];

const fmt = (w: TimeWindow) => `${w.start}–${w.end === "24:00" ? "00:00" : w.end}`;

/** Agrupa días consecutivos con el mismo horario: «Martes a jueves · 13:00–16:30, 19:30–23:30». */
export function summarizeWeeklySchedule(schedule: TimeWindow[][]): { days: string; hours: string }[] {
  const rows: { from: number; to: number; key: string }[] = [];
  for (const day of ORDER) {
    const key = (schedule[day] ?? []).map(fmt).join(", ") || "Cerrado";
    const last = rows[rows.length - 1];
    if (last && last.key === key) last.to = day;
    else rows.push({ from: day, to: day, key });
  }
  return rows.map(({ from, to, key }) => {
    const a = DAY_NAMES[from];
    const days = from === to ? a : ORDER.indexOf(to) - ORDER.indexOf(from) === 1 ? `${a} y ${DAY_NAMES[to]}` : `${a} a ${DAY_NAMES[to]}`;
    return { days: days.charAt(0).toUpperCase() + days.slice(1), hours: key };
  });
}
