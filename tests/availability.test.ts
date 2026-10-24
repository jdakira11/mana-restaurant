import { describe, expect, it } from "vitest";
import { defaultReservationSettings } from "@/config/reservations";
import { fitsCapacity, isDateOpen, slotsFor, type OccupyingReservation } from "@/lib/reservations/availability";
import type { ReservationSettings } from "@/lib/reservations/settings-schema";
import { reservationSettingsSchema } from "@/lib/reservations/settings-schema";
import { addDays, minutesUntil, nowInTimezone, weekdayOf } from "@/lib/reservations/time";

const settings: ReservationSettings = {
  ...defaultReservationSettings,
  timezone: "Europe/Madrid",
  slotIntervalMinutes: 30,
  reservationDurationMinutes: 120,
  lastArrivalBeforeCloseMinutes: 60,
  minNoticeMinutes: 120,
  maxDaysAhead: 30,
  capacity: { maxConcurrentCovers: 10, maxCoversPerArrival: 6 },
  weeklySchedule: [
    [], // domingo cerrado
    [],
    [{ start: "13:00", end: "16:00", label: "Mediodía" }],
    [{ start: "13:00", end: "16:00", label: "Mediodía" }],
    [{ start: "13:00", end: "16:00", label: "Mediodía" }],
    [{ start: "13:00", end: "16:00", label: "Mediodía" }, { start: "20:00", end: "23:00", label: "Noche" }],
    [{ start: "13:00", end: "16:00", label: "Mediodía" }],
  ],
  dateOverrides: [],
};

// Martes 3 de noviembre de 2026, 10:00 hora local
const now = { date: "2026-11-03", minutes: 10 * 60 };

describe("utilidades de tiempo", () => {
  it("calcula el día de la semana", () => {
    expect(weekdayOf("2026-11-03")).toBe(2);
    expect(weekdayOf("2026-11-08")).toBe(0);
  });
  it("convierte la hora actual a la zona del restaurante", () => {
    // 2026-07-01T22:30Z → Madrid (UTC+2) 00:30 del día 2
    expect(nowInTimezone("Europe/Madrid", new Date("2026-07-01T22:30:00Z"))).toEqual({ date: "2026-07-02", minutes: 30 });
    // → Ciudad de México (UTC-6) 16:30 del día 1
    expect(nowInTimezone("America/Mexico_City", new Date("2026-07-01T22:30:00Z"))).toEqual({ date: "2026-07-01", minutes: 990 });
  });
  it("calcula minutos hasta una hora local", () => {
    expect(minutesUntil({ date: "2026-11-03", minutes: 1380 }, "2026-11-04", 60)).toBe(120);
  });
});

describe("generación de horarios", () => {
  it("ofrece llegadas cada intervalo hasta la última llegada permitida", () => {
    const slots = slotsFor({ date: "2026-11-04", partySize: 2, settings, reservations: [], blocks: [], now });
    expect(slots.map((s) => s.time)).toEqual(["13:00", "13:30", "14:00", "14:30", "15:00"]);
    expect(slots.every((s) => s.status === "available")).toBe(true);
  });

  it("agrupa por servicio", () => {
    const slots = slotsFor({ date: "2026-11-06", partySize: 2, settings, reservations: [], blocks: [], now });
    expect(new Set(slots.map((s) => s.service))).toEqual(new Set(["Mediodía", "Noche"]));
    expect(slots.at(-1)?.time).toBe("22:00");
  });

  it("no ofrece fechas pasadas, cerradas ni fuera de rango", () => {
    expect(slotsFor({ date: "2026-11-02", partySize: 2, settings, reservations: [], blocks: [], now })).toEqual([]);
    expect(slotsFor({ date: "2026-11-08", partySize: 2, settings, reservations: [], blocks: [], now })).toEqual([]);
    expect(slotsFor({ date: addDays(now.date, 31), partySize: 2, settings, reservations: [], blocks: [], now })).toEqual([]);
    expect(isDateOpen("2026-11-02", settings, [], now)).toBe(false);
    expect(isDateOpen("2026-11-08", settings, [], now)).toBe(false);
    expect(isDateOpen("2026-11-04", settings, [], now)).toBe(true);
  });

  it("respeta la antelación mínima en el día actual", () => {
    const at1130 = { date: "2026-11-03", minutes: 11 * 60 + 30 };
    const slots = slotsFor({ date: "2026-11-03", partySize: 2, settings, reservations: [], blocks: [], now: at1130 });
    expect(slots.find((s) => s.time === "13:00")?.status).toBe("too_soon");
    expect(slots.find((s) => s.time === "13:30")?.status).toBe("available");
  });

  it("cierra el día si todos los horarios quedan dentro de la antelación mínima", () => {
    const late = { date: "2026-11-03", minutes: 14 * 60 };
    expect(isDateOpen("2026-11-03", settings, [], late)).toBe(false);
  });

  it("aplica cierres y horarios especiales", () => {
    const withOverrides: ReservationSettings = {
      ...settings,
      dateOverrides: [
        { date: "2026-11-04", closed: true },
        { date: "2026-11-08", windows: [{ start: "20:00", end: "22:00" }] },
      ],
    };
    expect(isDateOpen("2026-11-04", withOverrides, [], now)).toBe(false);
    const sunday = slotsFor({ date: "2026-11-08", partySize: 2, settings: withOverrides, reservations: [], blocks: [], now });
    expect(sunday.map((s) => s.time)).toEqual(["20:00", "20:30", "21:00"]);
    expect(sunday[0].service).toBe("Noche");
  });

  it("aplica bloqueos de día completo y de franja", () => {
    expect(isDateOpen("2026-11-04", settings, [{ date: "2026-11-04", startMinutes: null, endMinutes: null }], now)).toBe(false);
    const slots = slotsFor({
      date: "2026-11-04",
      partySize: 2,
      settings,
      reservations: [],
      blocks: [{ date: "2026-11-04", startMinutes: 13 * 60, endMinutes: 14 * 60 }],
      now,
    });
    expect(slots.filter((s) => s.status === "blocked").map((s) => s.time)).toEqual(["13:00", "13:30"]);
  });
});

describe("capacidad", () => {
  const r = (start: string, partySize: number): OccupyingReservation => {
    const [h, m] = start.split(":").map(Number);
    return { startMinutes: h * 60 + m, durationMinutes: 120, partySize };
  };

  it("bloquea cuando se supera la ocupación simultánea durante la estancia", () => {
    const existing = [r("13:00", 4), r("14:00", 4)];
    // A las 13:30 hay 4 sentados; a las 14:00 habrá 8. Un grupo de 3 llegaría a 11 > 10.
    expect(fitsCapacity(13 * 60 + 30, 3, existing, settings)).toBe(false);
    expect(fitsCapacity(13 * 60 + 30, 2, existing, settings)).toBe(true);
    // A las 15:00 la primera reserva ya se ha ido (13:00–15:00)
    expect(fitsCapacity(15 * 60, 6, existing, settings)).toBe(true);
  });

  it("limita los comensales que llegan en el mismo horario", () => {
    expect(fitsCapacity(13 * 60, 3, [r("13:00", 4)], settings)).toBe(false);
    expect(fitsCapacity(13 * 60, 2, [r("13:00", 4)], settings)).toBe(true);
  });

  it("marca como completos los horarios sin capacidad", () => {
    const slots = slotsFor({
      date: "2026-11-04",
      partySize: 4,
      settings,
      reservations: [r("13:00", 6), r("13:30", 4)],
      blocks: [],
      now,
    });
    const status = Object.fromEntries(slots.map((s) => [s.time, s.status]));
    expect(status["13:00"]).toBe("full");
    expect(status["14:00"]).toBe("full");
    expect(status["15:00"]).toBe("available");
    expect(status["15:30"]).toBe(undefined); // fuera de horario
  });
});

describe("validación de ajustes", () => {
  it("acepta la configuración predeterminada", () => {
    expect(reservationSettingsSchema.safeParse(defaultReservationSettings).success).toBe(true);
  });
  it("rechaza zonas horarias y rangos no válidos", () => {
    expect(reservationSettingsSchema.safeParse({ ...defaultReservationSettings, timezone: "Mars/Base" }).success).toBe(false);
    expect(reservationSettingsSchema.safeParse({ ...defaultReservationSettings, partySize: { min: 6, max: 2 } }).success).toBe(false);
  });
});
