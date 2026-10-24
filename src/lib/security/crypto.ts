import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Hash con sal secreta: permite limitar abusos por IP sin almacenar la IP en claro. */
export function anonymize(value: string): string {
  const salt = process.env.IP_HASH_SALT || process.env.SESSION_SECRET || "mana-dev-salt";
  return createHmac("sha256", salt).update(value).digest("hex").slice(0, 32);
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Referencia legible para el cliente, p. ej. MN-7K3Q9P. */
export function reservationReference(): string {
  const bytes = randomBytes(6);
  let out = "";
  for (const b of bytes) out += REF_ALPHABET[b % REF_ALPHABET.length];
  return `MN-${out}`;
}
