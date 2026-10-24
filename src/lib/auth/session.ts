import "server-only";
import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { safeEqual } from "@/lib/security/crypto";

const SESSION_HOURS = 8;
const isProd = process.env.NODE_ENV === "production";
/** En producción el prefijo __Host- obliga a Secure, Path=/ y sin Domain. */
const COOKIE_NAME = isProd ? "__Host-mana_admin" : "mana_admin";

export interface AdminSession {
  sub: string;
  exp: number;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && (process.env.SESSION_SECRET?.length ?? 0) >= 32);
}

function sign(payload: string): string {
  return createHmac("sha256", process.env.SESSION_SECRET!).update(payload).digest("base64url");
}

function encode(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(token: string | undefined): AdminSession | null {
  if (!token || !isAdminConfigured()) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as AdminSession;
    if (typeof session.exp !== "number" || session.exp < Date.now()) return null;
    if (session.sub !== process.env.ADMIN_EMAIL?.toLowerCase()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function createAdminSession(email: string): Promise<void> {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  (await cookies()).set(COOKIE_NAME, encode({ sub: email.toLowerCase(), exp }), {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroyAdminSession(): Promise<void> {
  // Se sobrescribe con los mismos atributos: una cookie __Host- solo puede borrarse con Secure y Path=/.
  (await cookies()).set(COOKIE_NAME, "", { httpOnly: true, secure: isProd, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  // La validación compara con la hora actual: debe resolverse siempre en tiempo de petición.
  await connection();
  return decode(token);
}

/**
 * Capa de acceso a datos: TODA página o acción del panel debe llamar a esta función.
 * La comprobación se hace en el servidor; ocultar botones en la interfaz no protege nada.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
