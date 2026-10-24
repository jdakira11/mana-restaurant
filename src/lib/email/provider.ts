import "server-only";

export type SendResult = { status: "sent"; id: string } | { status: "skipped"; reason: string } | { status: "failed"; reason: string };

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  idempotencyKey?: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Envío mediante la API de Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Si no hay credenciales, NO se simula el envío: se devuelve "skipped" y queda registrado.
 */
export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  if (!isEmailConfigured()) {
    return { status: "skipped", reason: "Correo no configurado (faltan RESEND_API_KEY / EMAIL_FROM)" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        ...(message.idempotencyKey ? { "Idempotency-Key": message.idempotencyKey.slice(0, 256) } : {}),
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { status: "failed", reason: `Resend ${res.status}: ${body.slice(0, 300)}` };
    }
    const data = (await res.json()) as { id?: string };
    return { status: "sent", id: data.id ?? "" };
  } catch (err) {
    return { status: "failed", reason: err instanceof Error ? err.message : String(err) };
  }
}
