import type { ReservationSettings } from "./settings-schema";
import { addDays, diffDays, formatTime, minutesUntil, parseTime, weekdayOf } from "./time";

/** Reserva que ocupa capacidad (pendiente o confirmada). */
export interface OccupyingReservation {
  startMinutes: number;
  durationMinutes: number;
  partySize: number;
}

/** Bloqueo creado desde el panel. Sin horas = día completo. Con horas = se bloquean las llegadas en [start, end). */
export interface Block {
  date: string;
  startMinutes: number | null;
  endMinutes: number | null;
}

export interface ServiceWindow {
  start: number;
  end: number;
  label: string;
}

export type SlotStatus = "available" | "full" | "too_soon" | "blocked";

export interface Slot {
  time: string;
  minutes: number;
  service: string;
  status: SlotStatus;
}

export interface Now {
  date: string;
  minutes: number;
}

function defaultLabel(start: number): string {
  return start < 17 * 60 ? "Mediodía" : "Noche";
}

/** Ventanas de servicio de una fecha, teniendo en cuenta horarios especiales y bloqueos de día completo. */
export function serviceWindowsFor(date: string, settings: ReservationSettings, blocks: Block[]): ServiceWindow[] {
  if (blocks.some((b) => b.date === date && b.startMinutes === null)) return [];
  const override = settings.dateOverrides.find((o) => o.date === date);
  if (override?.closed) return [];
  const windows = override?.windows ?? settings.weeklySchedule[weekdayOf(date)] ?? [];
  return windows.map((w) => {
    const start = parseTime(w.start);
    return { start, end: parseTime(w.end), label: w.label || defaultLabel(start) };
  });
}

/** Horas de llegada candidatas dentro de cada servicio. */
export function arrivalTimes(windows: ServiceWindow[], settings: ReservationSettings): { minutes: number; service: string }[] {
  const out: { minutes: number; service: string }[] = [];
  for (const w of windows) {
    const last = Math.min(w.end - settings.lastArrivalBeforeCloseMinutes, 23 * 60 + 59);
    for (let m = w.start; m <= last; m += settings.slotIntervalMinutes) {
      if (!out.some((o) => o.minutes === m)) out.push({ minutes: m, service: w.label });
    }
  }
  return out.sort((a, b) => a.minutes - b.minutes);
}

/** Comensales sentados en un minuto concreto. */
function occupancyAt(minute: number, reservations: OccupyingReservation[]): number {
  let covers = 0;
  for (const r of reservations) {
    if (r.startMinutes <= minute && minute < r.startMinutes + r.durationMinutes) covers += r.partySize;
  }
  return covers;
}

/**
 * ¿Cabe un grupo de `partySize` que llega a `start`?
 * - La ocupación simultánea no debe superar `maxConcurrentCovers` en ningún momento de su estancia.
 *   El máximo de ocupación dentro de [start, start+duración) solo puede darse en `start`
 *   o en la llegada de otra reserva dentro de ese intervalo, así que basta con comprobar esos puntos.
 * - Las llegadas en ese mismo horario no deben superar `maxCoversPerArrival`.
 */
export function fitsCapacity(
  start: number,
  partySize: number,
  reservations: OccupyingReservation[],
  settings: ReservationSettings,
): boolean {
  const duration = settings.reservationDurationMinutes;
  const { maxConcurrentCovers, maxCoversPerArrival } = settings.capacity;

  if (partySize > maxConcurrentCovers) return false;

  if (maxCoversPerArrival !== null) {
    const arriving = reservations.filter((r) => r.startMinutes === start).reduce((sum, r) => sum + r.partySize, 0);
    if (arriving + partySize > maxCoversPerArrival) return false;
  }

  const checkpoints = [start, ...reservations.map((r) => r.startMinutes).filter((m) => m > start && m < start + duration)];
  return checkpoints.every((m) => occupancyAt(m, reservations) + partySize <= maxConcurrentCovers);
}

function isBlocked(date: string, minute: number, blocks: Block[]): boolean {
  return blocks.some(
    (b) => b.date === date && b.startMinutes !== null && b.endMinutes !== null && minute >= b.startMinutes && minute < b.endMinutes,
  );
}

/** Estado de cada horario de una fecha para un tamaño de grupo dado. */
export function slotsFor(params: {
  date: string;
  partySize: number;
  settings: ReservationSettings;
  reservations: OccupyingReservation[];
  blocks: Block[];
  now: Now;
}): Slot[] {
  const { date, partySize, settings, reservations, blocks, now } = params;
  if (!isDateInBookingRange(date, settings, now)) return [];
  const windows = serviceWindowsFor(date, settings, blocks);
  return arrivalTimes(windows, settings).map(({ minutes, service }) => {
    let status: SlotStatus = "available";
    if (minutesUntil(now, date, minutes) < settings.minNoticeMinutes) status = "too_soon";
    else if (isBlocked(date, minutes, blocks)) status = "blocked";
    else if (!fitsCapacity(minutes, partySize, reservations, settings)) status = "full";
    return { time: formatTime(minutes), minutes, service, status };
  });
}

export function isDateInBookingRange(date: string, settings: ReservationSettings, now: Now): boolean {
  const offset = diffDays(now.date, date);
  return offset >= 0 && offset <= settings.maxDaysAhead;
}

/**
 * ¿Tiene la fecha algún horario potencialmente reservable? (sin mirar capacidad: eso se calcula
 * al elegir el día, con el tamaño de grupo concreto).
 */
export function isDateOpen(date: string, settings: ReservationSettings, blocks: Block[], now: Now): boolean {
  if (!isDateInBookingRange(date, settings, now)) return false;
  const windows = serviceWindowsFor(date, settings, blocks);
  return arrivalTimes(windows, settings).some(
    ({ minutes }) => minutesUntil(now, date, minutes) >= settings.minNoticeMinutes && !isBlocked(date, minutes, blocks),
  );
}

export function openDatesBetween(from: string, days: number, settings: ReservationSettings, blocks: Block[], now: Now) {
  const out: { date: string; open: boolean }[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(from, i);
    out.push({ date, open: isDateOpen(date, settings, blocks, now) });
  }
  return out;
}
