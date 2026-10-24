import { NextResponse } from "next/server";
import { getReservationSettings } from "@/lib/reservations/settings-store";
import { connection } from "next/server";

/** Horario semanal público (el mismo que usa el sistema de reservas). */
export async function GET() {
  await connection();
  try {
    const s = await getReservationSettings();
    return NextResponse.json(
      { weeklySchedule: s.weeklySchedule, timezone: s.timezone },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" } },
    );
  } catch {
    return NextResponse.json({ error: "No disponible" }, { status: 503 });
  }
}
