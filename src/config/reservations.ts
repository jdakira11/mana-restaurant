import type { ReservationSettings } from "@/lib/reservations/settings-schema";

/**
 * Configuración PROVISIONAL del sistema de reservas.
 *
 * ⚠️ Ninguno de estos valores es un dato real de Maná: son valores de arranque para que
 * el sistema funcione mientras el propietario facilita horarios, capacidad y políticas.
 *
 * - Estos valores son los predeterminados. Desde el panel (/admin/ajustes) se pueden
 *   sobrescribir sin tocar el código; lo guardado en el panel tiene prioridad.
 * - La confirmación es MANUAL por defecto: mientras la capacidad real no esté verificada,
 *   ninguna reserva se confirma automáticamente.
 */
export const defaultReservationSettings: ReservationSettings = {
  timezone: "America/Santiago", // Las Condes, Región Metropolitana (Chile).
  confirmationMode: "manual",
  partySize: { min: 1, max: 10 },
  slotIntervalMinutes: 30,
  reservationDurationMinutes: 120,
  lastArrivalBeforeCloseMinutes: 60,
  capacity: {
    maxConcurrentCovers: 40,
    maxCoversPerArrival: 16,
  },
  minNoticeMinutes: 120,
  maxDaysAhead: 60,
  // 0 domingo · 1 lunes · 2 martes · 3 miércoles · 4 jueves · 5 viernes · 6 sábado
  weeklySchedule: [
    [{ start: "13:00", end: "17:00", label: "Mediodía" }],
    [],
    [{ start: "13:00", end: "16:30", label: "Mediodía" }, { start: "19:30", end: "23:30", label: "Noche" }],
    [{ start: "13:00", end: "16:30", label: "Mediodía" }, { start: "19:30", end: "23:30", label: "Noche" }],
    [{ start: "13:00", end: "16:30", label: "Mediodía" }, { start: "19:30", end: "23:30", label: "Noche" }],
    [{ start: "13:00", end: "16:30", label: "Mediodía" }, { start: "19:30", end: "24:00", label: "Noche" }],
    [{ start: "13:00", end: "17:00", label: "Mediodía" }, { start: "19:30", end: "24:00", label: "Noche" }],
  ],
  dateOverrides: [
    // Ejemplos:
    // { date: "2026-12-25", closed: true, note: "Navidad" },
    // { date: "2026-12-31", windows: [{ start: "20:00", end: "24:00", label: "Cena especial" }] },
  ],
};
