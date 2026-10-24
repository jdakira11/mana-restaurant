import { NextResponse, type NextRequest } from "next/server";
import { DatabaseConfigError } from "@/lib/db/client";
import { getDaySlots, getMonthAvailability } from "@/lib/reservations/service";
import { toPublicSettings } from "@/lib/reservations/settings-store";
import { isValidDate } from "@/lib/reservations/time";
import { checkRateLimit, clientIp, RATE_LIMITS } from "@/lib/security/rate-limit";

const noStore = { "Cache-Control": "no-store" };

const badRequest = () => NextResponse.json({ error: "Parámetros no válidos" }, { status: 400, headers: noStore });

/**
 * GET /api/availability?from=YYYY-MM-DD&days=42   → días abiertos para el calendario
 * GET /api/availability?date=YYYY-MM-DD&party=4    → horarios de un día para un grupo
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const date = params.get("date");
  const party = Number(params.get("party"));
  const from = params.get("from");
  const days = Math.min(Math.max(Number(params.get("days") ?? 42), 1), 120);

  if (date !== null) {
    if (!isValidDate(date) || !Number.isInteger(party) || party < 1 || party > 100) return badRequest();
  } else if (!from || !isValidDate(from) || !Number.isFinite(days)) {
    return badRequest();
  }

  try {
    const limit = await checkRateLimit(RATE_LIMITS.availability, clientIp(request.headers));
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Demasiadas consultas. Espera un momento." },
        { status: 429, headers: { ...noStore, "Retry-After": String(limit.retryAfter) } },
      );
    }

    if (date !== null) {
      const { settings, slots } = await getDaySlots(date, party);
      return NextResponse.json(
        {
          date,
          partySize: party,
          slots: slots.map((s) => ({ time: s.time, service: s.service, available: s.status === "available", reason: s.status })),
          settings: toPublicSettings(settings),
        },
        { headers: noStore },
      );
    }

    const { settings, today, dates } = await getMonthAvailability(from!, days);
    return NextResponse.json({ today, dates, settings: toPublicSettings(settings) }, { headers: noStore });
  } catch (err) {
    console.error("[api/availability]", err);
    const message =
      err instanceof DatabaseConfigError
        ? "El sistema de reservas aún no está configurado."
        : "No hemos podido consultar la disponibilidad. Inténtalo de nuevo.";
    return NextResponse.json({ error: message }, { status: 503, headers: noStore });
  }
}
