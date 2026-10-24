/** Utilidades de fecha/hora sin dependencias. Las fechas se manejan como "YYYY-MM-DD" y las horas como minutos desde medianoche. */

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toUtcDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function isValidDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const dt = toUtcDate(date);
  return dt.toISOString().slice(0, 10) === date;
}

/** 0 = domingo … 6 = sábado */
export function weekdayOf(date: string): number {
  return toUtcDate(date).getUTCDay();
}

export function addDays(date: string, days: number): string {
  const dt = toUtcDate(date);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function diffDays(from: string, to: string): number {
  return Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / 86_400_000);
}

/** Fecha y minuto actuales en la zona horaria del restaurante. */
export function nowInTimezone(timezone: string, now: Date = new Date()): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

/** Minutos entre "ahora" (hora local del restaurante) y una fecha/hora local. Hora de reloj de pared. */
export function minutesUntil(now: { date: string; minutes: number }, date: string, minutes: number): number {
  return diffDays(now.date, date) * 1440 + (minutes - now.minutes);
}

export function formatDateLong(date: string, locale = "es"): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(toUtcDate(date));
}
