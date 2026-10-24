// Aplica el esquema en la base de datos de DATABASE_URL.
// Uso: node --env-file=.env.local scripts/migrate.mts   (o npm run db:migrate con las variables cargadas)
import pg from "pg";
import { SCHEMA_SQL } from "../src/lib/db/schema.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL. (Sin ella, la web usa PGlite y aplica el esquema automáticamente.)");
  process.exit(1);
}
const sslMode = process.env.DATABASE_SSL ?? "require";
const client = new pg.Client({
  connectionString: url,
  ssl: sslMode === "disable" ? false : sslMode === "no-verify" ? { rejectUnauthorized: false } : { rejectUnauthorized: true, ca: process.env.DATABASE_CA_CERT?.replace(/\n/g, "\n") || undefined },
});
await client.connect();
await client.query(SCHEMA_SQL);
await client.end();
console.log("Esquema aplicado correctamente.");
