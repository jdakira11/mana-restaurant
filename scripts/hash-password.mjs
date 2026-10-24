// Genera el valor de ADMIN_PASSWORD_HASH.
// Uso:  npm run admin:hash -- "tu-contraseña-segura"
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error("Indica una contraseña de al menos 12 caracteres:  npm run admin:hash -- \"contraseña\"");
  process.exit(1);
}
const N = 16384, r = 8, p = 1;
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N, r, p });
console.log(`ADMIN_PASSWORD_HASH=scrypt:${N}:${r}:${p}:${salt.toString("base64url")}:${hash.toString("base64url")}`);
console.log(`\nSi aún no tienes SESSION_SECRET, puedes usar:\nSESSION_SECRET=${randomBytes(32).toString("base64url")}`);
