import "server-only";

/**
 * Verificación opcional con Cloudflare Turnstile (anti-bots sin captchas molestos).
 * Solo se activa si TURNSTILE_SECRET_KEY y NEXT_PUBLIC_TURNSTILE_SITE_KEY están definidas.
 * Documentación: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  if (!isTurnstileEnabled()) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
