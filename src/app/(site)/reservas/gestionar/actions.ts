"use server";

import { headers } from "next/headers";
import { notify } from "@/lib/reservations/notifications";
import { cancelByManageToken, ReservationError } from "@/lib/reservations/service";
import { checkRateLimit, clientIp, RATE_LIMITS } from "@/lib/security/rate-limit";

export interface CancelState {
  ok: boolean;
  message: string | null;
}

export async function cancelReservationAction(_prev: CancelState, formData: FormData): Promise<CancelState> {
  const token = String(formData.get("token") ?? "");
  const limit = await checkRateLimit(RATE_LIMITS.manage, clientIp(await headers()));
  if (!limit.ok) return { ok: false, message: "Demasiados intentos. Inténtalo más tarde." };
  try {
    const reservation = await cancelByManageToken(token);
    await notify("cancelled_by_customer", reservation, { notifyRestaurant: true });
    return { ok: true, message: "Tu reserva ha sido cancelada." };
  } catch (err) {
    if (err instanceof ReservationError) return { ok: false, message: err.message };
    console.error("[gestionar] cancelación", err);
    return { ok: false, message: "No hemos podido cancelar la reserva. Inténtalo de nuevo." };
  }
}
