import "server-only";
import { getSiteUrl } from "@/config/site";
import { getDb } from "@/lib/db/client";
import { sendEmail } from "@/lib/email/provider";
import { customerEmail, restaurantEmail, type NotificationEvent } from "@/lib/email/templates";
import { logNotification, type ReservationRecord } from "./repository";

export function manageUrlFor(token: string): string {
  return `${getSiteUrl()}/reservas/gestionar?token=${encodeURIComponent(token)}`;
}

/**
 * Envía los avisos al cliente y al restaurante y deja constancia del resultado
 * (enviado / fallido / omitido por falta de configuración) en `notification_log`.
 * Nunca lanza: un fallo de correo no debe deshacer una reserva ya guardada.
 */
export async function notify(
  event: NotificationEvent,
  reservation: ReservationRecord,
  opts: { manageToken?: string | null; notifyRestaurant?: boolean } = {},
): Promise<void> {
  try {
    const db = await getDb();
    const manageUrl = opts.manageToken ? manageUrlFor(opts.manageToken) : null;

    const c = customerEmail(event, reservation, manageUrl);
    const customerResult = await sendEmail({
      to: reservation.email,
      ...c,
      replyTo: process.env.RESTAURANT_NOTIFICATION_EMAIL || undefined,
      idempotencyKey: `${reservation.id}:${event}:customer`,
    });
    await logNotification(db, {
      reservationId: reservation.id,
      event,
      recipient: "customer",
      status: customerResult.status,
      detail: customerResult.status === "sent" ? customerResult.id : customerResult.reason,
    });

    if (opts.notifyRestaurant) {
      const to = process.env.RESTAURANT_NOTIFICATION_EMAIL;
      const r = restaurantEmail(event, reservation, `${getSiteUrl()}/admin?date=${reservation.date}`);
      const restaurantResult = to
        ? await sendEmail({ to, ...r, replyTo: reservation.email, idempotencyKey: `${reservation.id}:${event}:restaurant` })
        : ({ status: "skipped", reason: "Falta RESTAURANT_NOTIFICATION_EMAIL" } as const);
      await logNotification(db, {
        reservationId: reservation.id,
        event,
        recipient: "restaurant",
        status: restaurantResult.status,
        detail: restaurantResult.status === "sent" ? restaurantResult.id : restaurantResult.reason,
      });
    }
  } catch (err) {
    console.error("[reservas] Error al registrar/enviar notificaciones", err);
  }
}
