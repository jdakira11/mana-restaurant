import "server-only";
import { getDb } from "@/lib/db/client";
import { anonymize } from "./crypto";

export interface RateLimitRule {
  /** Nombre de la regla, p. ej. "reservation". */
  name: string;
  limit: number;
  windowSeconds: number;
}

export const RATE_LIMITS = {
  reservation: { name: "reservation", limit: 5, windowSeconds: 600 },
  availability: { name: "availability", limit: 90, windowSeconds: 60 },
  login: { name: "login", limit: 5, windowSeconds: 900 },
  manage: { name: "manage", limit: 20, windowSeconds: 600 },
} satisfies Record<string, RateLimitRule>;

/**
 * Límite de peticiones por ventana fija, persistido en base de datos para que funcione
 * también con varias instancias o funciones serverless. La clave se guarda anonimizada.
 */
export async function checkRateLimit(rule: RateLimitRule, identifier: string): Promise<{ ok: boolean; retryAfter: number }> {
  const db = await getDb();
  const windowMs = rule.windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const bucket = `${rule.name}:${anonymize(identifier)}`;

  const { rows } = await db.query<{ hits: number }>(
    `insert into rate_limits (bucket, window_start, hits) values ($1, $2, 1)
     on conflict (bucket, window_start) do update set hits = rate_limits.hits + 1
     returning hits`,
    [bucket, windowStart.toISOString()],
  );

  if (Math.random() < 0.02) {
    await db.query(`delete from rate_limits where window_start < now() - interval '1 day'`).catch(() => {});
  }

  const hits = Number(rows[0]?.hits ?? 0);
  const retryAfter = Math.ceil((windowStart.getTime() + windowMs - Date.now()) / 1000);
  return { ok: hits <= rule.limit, retryAfter };
}

/**
 * IP del cliente. Detrás de un proxy de confianza (Vercel, Cloudflare, Nginx) llega en
 * x-forwarded-for / x-real-ip. Si el servidor se expone sin proxy, estas cabeceras podrían
 * falsificarse: configura el proxy para sobrescribirlas.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
