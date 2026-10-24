import { randomUUID } from "node:crypto";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

process.env.PGLITE_DATA_DIR = "memory://";

const { getDb } = await import("@/lib/db/client");
const { createReservation, changeReservationStatus, cancelByManageToken, getDaySlots, ReservationError } = await import(
  "@/lib/reservations/service"
);
const { saveReservationSettings } = await import("@/lib/reservations/settings-store");
const { listReservations } = await import("@/lib/reservations/repository");
const { defaultReservationSettings } = await import("@/config/reservations");
const { addDays, nowInTimezone, weekdayOf } = await import("@/lib/reservations/time");

const TZ = "Europe/Madrid";
const allWeek = Array.from({ length: 7 }, () => [{ start: "13:00", end: "16:00", label: "Mediodía" }]);

/** Una fecha futura cualquiera (dentro del rango) para no depender del día en que se ejecuten las pruebas. */
const futureDate = addDays(nowInTimezone(TZ).date, 3);

function request(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: "Cliente Prueba",
    email: `cliente-${randomUUID()}@example.com`,
    phone: `+34 6${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`,
    date: futureDate,
    time: "13:00",
    partySize: 2,
    notes: "",
    privacy: true as const,
    idempotencyKey: randomUUID(),
    website: "",
    startedAt: Date.now() - 10_000,
    ...overrides,
  };
}

beforeAll(async () => {
  await getDb();
});

beforeEach(async () => {
  const db = await getDb();
  await db.query("delete from notification_log");
  await db.query("delete from reservations");
  await db.query("delete from reservation_blocks");
  await saveReservationSettings({
    ...defaultReservationSettings,
    timezone: TZ,
    confirmationMode: "manual",
    minNoticeMinutes: 0,
    maxDaysAhead: 30,
    capacity: { maxConcurrentCovers: 10, maxCoversPerArrival: null },
    weeklySchedule: allWeek,
    dateOverrides: [],
  });
});

describe("createReservation", () => {
  it("guarda la reserva como pendiente en modo manual", async () => {
    const { reservation, manageToken } = await createReservation(request() as never);
    expect(reservation.status).toBe("pending");
    expect(reservation.reference).toMatch(/^MN-[A-Z2-9]{6}$/);
    expect(manageToken).toBeTruthy();
    const db = await getDb();
    const rows = await listReservations(db, { date: futureDate, status: "all" });
    expect(rows).toHaveLength(1);
    expect(rows[0].time).toBe("13:00");
  });

  it("confirma automáticamente en modo auto", async () => {
    await saveReservationSettings({
      ...defaultReservationSettings,
      timezone: TZ,
      confirmationMode: "auto",
      minNoticeMinutes: 0,
      weeklySchedule: allWeek,
      capacity: { maxConcurrentCovers: 10, maxCoversPerArrival: null },
    });
    const { reservation } = await createReservation(request() as never);
    expect(reservation.status).toBe("confirmed");
  });

  it("es idempotente ante reenvíos con la misma clave", async () => {
    const req = request();
    const first = await createReservation(req as never);
    const second = await createReservation(req as never);
    expect(second.replayed).toBe(true);
    expect(second.reservation.id).toBe(first.reservation.id);
  });

  it("rechaza reservas duplicadas (mismo correo o teléfono el mismo día)", async () => {
    const req = request();
    await createReservation(req as never);
    await expect(createReservation(request({ email: req.email, time: "14:00" }) as never)).rejects.toMatchObject({ code: "duplicate" });
    await expect(createReservation(request({ phone: req.phone.replace(/\s/g, ""), time: "14:00" }) as never)).rejects.toMatchObject({
      code: "duplicate",
    });
  });

  it("rechaza horarios inexistentes, fechas pasadas y grupos fuera de rango", async () => {
    await expect(createReservation(request({ time: "13:10" }) as never)).rejects.toBeInstanceOf(ReservationError);
    await expect(createReservation(request({ date: "2020-01-01" }) as never)).rejects.toMatchObject({ code: "date_unavailable" });
    await expect(createReservation(request({ partySize: 50 }) as never)).rejects.toMatchObject({ code: "party_size" });
  });

  it("respeta los bloqueos creados en el panel", async () => {
    const db = await getDb();
    await db.query("insert into reservation_blocks (block_date, start_minutes, end_minutes) values ($1, 780, 840)", [futureDate]);
    await expect(createReservation(request({ time: "13:00" }) as never)).rejects.toMatchObject({ code: "slot_unavailable" });
    await expect(createReservation(request({ time: "14:00" }) as never)).resolves.toBeTruthy();
  });

  it("no supera la capacidad con solicitudes simultáneas", async () => {
    // Capacidad 10. Lanzamos 8 solicitudes de 2 personas a la vez para el mismo horario: solo caben 5.
    const results = await Promise.allSettled(Array.from({ length: 8 }, () => createReservation(request({ partySize: 2 }) as never)));
    const ok = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    expect(ok).toHaveLength(5);
    expect(rejected.every((r) => r.reason?.code === "slot_unavailable")).toBe(true);

    const db = await getDb();
    const rows = await listReservations(db, { date: futureDate, status: "active" });
    expect(rows.reduce((s, r) => s + r.partySize, 0)).toBe(10);

    const { slots } = await getDaySlots(futureDate, 1);
    expect(slots.find((s) => s.time === "13:00")?.status).toBe("full");
  });

  it("libera capacidad al cancelar", async () => {
    const big = await createReservation(request({ partySize: 10 }) as never);
    await expect(createReservation(request({ partySize: 2 }) as never)).rejects.toMatchObject({ code: "slot_unavailable" });
    await changeReservationStatus(big.reservation.id, "cancel", "admin");
    await expect(createReservation(request({ partySize: 2 }) as never)).resolves.toBeTruthy();
  });
});

describe("transiciones de estado", () => {
  it("permite confirmar una pendiente y no reconfirmarla", async () => {
    const { reservation } = await createReservation(request() as never);
    const confirmed = await changeReservationStatus(reservation.id, "confirm", "admin");
    expect(confirmed.status).toBe("confirmed");
    await expect(changeReservationStatus(reservation.id, "confirm", "admin")).rejects.toMatchObject({ code: "invalid_transition" });
    await expect(changeReservationStatus(reservation.id, "decline", "admin")).rejects.toMatchObject({ code: "invalid_transition" });
  });

  it("permite al cliente cancelar con su enlace", async () => {
    const { manageToken } = await createReservation(request() as never);
    const cancelled = await cancelByManageToken(manageToken!);
    expect(cancelled.status).toBe("cancelled");
    await expect(cancelByManageToken(manageToken!)).rejects.toMatchObject({ code: "invalid_transition" });
    await expect(cancelByManageToken("token-inexistente-xxxxxxxxxxxx")).rejects.toMatchObject({ code: "not_found" });
  });
});

describe("datos de prueba coherentes", () => {
  it("la fecha usada está abierta", () => {
    expect(allWeek[weekdayOf(futureDate)].length).toBeGreaterThan(0);
  });
});
