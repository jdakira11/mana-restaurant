import { after, NextResponse, type NextRequest } from "next/server";
import { DatabaseConfigError } from "@/lib/db/client";
import { isEmailConfigured } from "@/lib/email/provider";
import { manageUrlFor, notify } from "@/lib/reservations/notifications";
import { reservationRequestSchema, type ReservationReceipt } from "@/lib/reservations/request-schema";
import { createReservation, ReservationError } from "@/lib/reservations/service";
import { checkRateLimit, clientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";

const noStore = { "Cache-Control": "no-store" };
const MIN_FILL_MS = 3000;

function json(body: unknown, status: number, extra: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...noStore, ...extra } });
}

/** POST /api/reservations — crea una solicitud de reserva. */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return json({ error: "Formato no admitido" }, 415);

  const ip = clientIp(request.headers);

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 10_000) return json({ error: "Solicitud demasiado grande" }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Solicitud no válida" }, 400);
  }

  const parsed = reservationRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    // Un honeypot relleno se responde como error genérico, sin dar pistas.
    if (fieldErrors.website) return json({ error: "No hemos podido procesar la solicitud." }, 400);
    return json({ error: "Revisa los campos marcados.", fieldErrors }, 422);
  }
  const input = parsed.data;

  if (Date.now() - input.startedAt < MIN_FILL_MS) {
    return json({ error: "No hemos podido procesar la solicitud. Inténtalo de nuevo en unos segundos." }, 400);
  }

  try {
    const limit = await checkRateLimit(RATE_LIMITS.reservation, ip);
    if (!limit.ok) {
      return json({ error: "Has enviado demasiadas solicitudes. Inténtalo más tarde o contáctanos directamente." }, 429, {
        "Retry-After": String(limit.retryAfter),
      });
    }

    if (!(await verifyTurnstile(input.turnstileToken, ip))) {
      return json({ error: "No hemos podido verificar que no eres un robot. Recarga la página e inténtalo de nuevo." }, 400);
    }

    const { reservation, manageToken, replayed } = await createReservation(input);

    if (!replayed) {
      after(() => notify("created", reservation, { manageToken, notifyRestaurant: true }));
    }

    const receipt: ReservationReceipt = {
      reference: reservation.reference,
      status: reservation.status,
      name: reservation.name,
      date: reservation.date,
      time: reservation.time,
      partySize: reservation.partySize,
      manageUrl: manageToken ? manageUrlFor(manageToken) : "",
      emailNotifications: isEmailConfigured(),
    };
    return json({ reservation: receipt }, replayed ? 200 : 201);
  } catch (err) {
    if (err instanceof ReservationError) {
      const status = err.code === "party_size" ? 422 : 409;
      return json({ error: err.message, code: err.code }, status);
    }
    console.error("[api/reservations]", err);
    const message =
      err instanceof DatabaseConfigError
        ? "El sistema de reservas aún no está configurado. Contáctanos por teléfono."
        : "No hemos podido registrar la reserva. Inténtalo de nuevo en unos minutos.";
    return json({ error: message }, 503);
  }
}
