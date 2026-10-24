import { siteConfig } from "@/config/site";
import type { ReservationRecord } from "@/lib/reservations/repository";
import { formatDateLong } from "@/lib/reservations/time";

export type NotificationEvent = "created" | "confirmed" | "declined" | "cancelled" | "cancelled_by_customer";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#F5EFE4;font-family:Helvetica,Arial,sans-serif;color:#1F1A16">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FBF8F2;border:1px solid #E2D7C3">
<tr><td style="padding:32px 32px 8px;font-family:Georgia,serif;font-size:28px;letter-spacing:.02em">${esc(siteConfig.name)}</td></tr>
<tr><td style="padding:8px 32px 32px"><h1 style="font-family:Georgia,serif;font-weight:normal;font-size:22px;margin:0 0 16px">${esc(title)}</h1>${bodyHtml}</td></tr>
</table></td></tr></table></body></html>`;
}

function details(r: ReservationRecord): { html: string; text: string } {
  const rows: [string, string][] = [
    ["Referencia", r.reference],
    ["Nombre", r.name],
    ["Fecha", formatDateLong(r.date)],
    ["Hora", r.time],
    ["Personas", String(r.partySize)],
  ];
  return {
    html: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #E2D7C3;margin:16px 0">${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 0;border-bottom:1px solid #E2D7C3;color:#6B6157;font-size:14px">${k}</td><td style="padding:8px 0;border-bottom:1px solid #E2D7C3;text-align:right;font-size:14px">${esc(v)}</td></tr>`,
      )
      .join("")}</table>`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
  };
}

const p = (s: string) => `<p style="font-size:15px;line-height:1.6;margin:0 0 12px">${s}</p>`;

export function customerEmail(event: NotificationEvent, r: ReservationRecord, manageUrl: string | null) {
  const d = details(r);
  const manage = manageUrl
    ? { html: p(`Puedes consultar o cancelar tu reserva aquí: <a href="${esc(manageUrl)}" style="color:#9A4A2B">gestionar reserva</a>.`), text: `Gestionar reserva: ${manageUrl}` }
    : { html: "", text: "" };

  const copy: Record<NotificationEvent, { subject: string; title: string; intro: string }> = {
    created:
      r.status === "confirmed"
        ? { subject: `Reserva confirmada · ${siteConfig.name}`, title: "Tu reserva está confirmada", intro: "Gracias por elegirnos. Te esperamos." }
        : {
            subject: `Hemos recibido tu solicitud · ${siteConfig.name}`,
            title: "Solicitud recibida",
            intro: "Tu solicitud de reserva está pendiente de confirmación. Te escribiremos en cuanto el equipo la revise. Todavía no es una reserva confirmada.",
          },
    confirmed: { subject: `Reserva confirmada · ${siteConfig.name}`, title: "Tu reserva está confirmada", intro: "Hemos confirmado tu reserva. Te esperamos." },
    declined: {
      subject: `Sobre tu solicitud de reserva · ${siteConfig.name}`,
      title: "No hemos podido confirmar tu reserva",
      intro: "Lo sentimos: no tenemos disponibilidad para la solicitud indicada. Puedes intentar otra fecha u horario desde nuestra web.",
    },
    cancelled: { subject: `Reserva cancelada · ${siteConfig.name}`, title: "Tu reserva ha sido cancelada", intro: "Te confirmamos que la siguiente reserva ha quedado cancelada." },
    cancelled_by_customer: {
      subject: `Reserva cancelada · ${siteConfig.name}`,
      title: "Has cancelado tu reserva",
      intro: "Te confirmamos la cancelación. Esperamos verte en otra ocasión.",
    },
  };
  const c = copy[event];
  const showManage = event === "created" || event === "confirmed";
  return {
    subject: c.subject,
    html: layout(c.title, p(esc(c.intro)) + d.html + (showManage ? manage.html : "")),
    text: `${c.title}\n\n${c.intro}\n\n${d.text}\n\n${showManage ? manage.text : ""}`.trim(),
  };
}

export function restaurantEmail(event: NotificationEvent, r: ReservationRecord, adminUrl: string) {
  const d = details(r);
  const contact = `Correo: ${r.email}\nTeléfono: ${r.phone}${r.notes ? `\nComentarios: ${r.notes}` : ""}`;
  const title =
    event === "created"
      ? r.status === "confirmed"
        ? "Nueva reserva confirmada automáticamente"
        : "Nueva solicitud de reserva pendiente"
      : event === "cancelled_by_customer"
        ? "Un cliente ha cancelado su reserva"
        : `Reserva actualizada: ${event}`;
  return {
    subject: `${title} · ${r.reference}`,
    html: layout(
      title,
      d.html +
        `<pre style="font-family:inherit;font-size:14px;white-space:pre-wrap;margin:0 0 16px">${esc(contact)}</pre>` +
        p(`<a href="${esc(adminUrl)}" style="color:#9A4A2B">Abrir el panel de reservas</a>`),
    ),
    text: `${title}\n\n${d.text}\n${contact}\n\nPanel: ${adminUrl}`,
  };
}
