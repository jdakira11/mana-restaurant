import "server-only";
import { scrypt, timingSafeEqual } from "node:crypto";

/**
 * Verifica una contraseña contra un hash con el formato que genera `npm run admin:hash`:
 *   scrypt:N:r:p:<sal base64url>:<hash base64url>
 * (se usan ":" y no "$" porque Next.js expande "$VAR" dentro de los ficheros .env).
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64url");
  const derived = await new Promise<Buffer>((resolve, reject) =>
    scrypt(password, Buffer.from(saltB64, "base64url"), expected.length, { N: Number(n), r: Number(r), p: Number(p), maxmem: 256 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
