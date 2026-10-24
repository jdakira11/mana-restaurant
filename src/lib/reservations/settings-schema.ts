import { z } from "zod";

const hhmm = z
  .string()
  .regex(/^([01]\d|2[0-4]):[0-5]\d$/, "Usa el formato HH:MM")
  .refine((v) => v <= "24:00", "La hora máxima es 24:00");

export const timeWindowSchema = z
  .object({
    start: hhmm,
    end: hhmm,
    /** Nombre del servicio que verá el cliente, p. ej. "Mediodía" o "Noche". */
    label: z.string().trim().max(30).optional(),
  })
  .refine((w) => w.end > w.start, { message: "El cierre debe ser posterior a la apertura", path: ["end"] });

export const dateOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** `true` = cerrado todo el día. */
  closed: z.boolean().optional(),
  /** Horario especial para esa fecha (sustituye al semanal). */
  windows: z.array(timeWindowSchema).optional(),
  note: z.string().max(120).optional(),
});

export const reservationSettingsSchema = z
  .object({
    /** Zona horaria IANA del restaurante, p. ej. "America/Santiago" o "Europe/Madrid". */
    timezone: z.string().min(3).refine((tz) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, "Zona horaria no válida"),
    /** auto: se confirma si hay disponibilidad · manual: el restaurante confirma cada solicitud. */
    confirmationMode: z.enum(["auto", "manual"]),
    partySize: z
      .object({ min: z.number().int().min(1).max(50), max: z.number().int().min(1).max(100) })
      .refine((p) => p.max >= p.min, { message: "El máximo debe ser mayor o igual al mínimo", path: ["max"] }),
    /** Cada cuántos minutos se ofrece un horario de llegada. */
    slotIntervalMinutes: z.number().int().min(5).max(120),
    /** Duración estimada de una reserva (ocupación de la mesa). */
    reservationDurationMinutes: z.number().int().min(15).max(480),
    /** Última llegada admitida: X minutos antes del cierre de cada servicio. */
    lastArrivalBeforeCloseMinutes: z.number().int().min(0).max(480),
    capacity: z.object({
      /** Máximo de comensales sentados simultáneamente. */
      maxConcurrentCovers: z.number().int().min(1).max(2000),
      /** Máximo de comensales que pueden llegar en un mismo horario (ritmo de cocina). `null` = sin límite. */
      maxCoversPerArrival: z.number().int().min(1).max(2000).nullable(),
    }),
    /** Antelación mínima para reservar online. */
    minNoticeMinutes: z.number().int().min(0).max(60 * 24 * 14),
    /** Hasta cuántos días en el futuro se admite reservar. */
    maxDaysAhead: z.number().int().min(1).max(365),
    /** Índice 0 = domingo … 6 = sábado. Un array vacío significa cerrado ese día. */
    weeklySchedule: z.array(z.array(timeWindowSchema).max(4)).length(7),
    dateOverrides: z.array(dateOverrideSchema).max(200),
  })
  .strict();

export type TimeWindow = z.infer<typeof timeWindowSchema>;
export type DateOverride = z.infer<typeof dateOverrideSchema>;
export type ReservationSettings = z.infer<typeof reservationSettingsSchema>;

/** Subconjunto de ajustes que puede ver el público. */
export interface PublicReservationSettings {
  timezone: string;
  confirmationMode: "auto" | "manual";
  partySize: { min: number; max: number };
  maxDaysAhead: number;
}
