// Vuelca el esquema SQL a db/schema.sql (para pegarlo en el editor SQL de Supabase, por ejemplo).
import { mkdirSync, writeFileSync } from "node:fs";
import { SCHEMA_SQL } from "../src/lib/db/schema.ts";

mkdirSync("db", { recursive: true });
writeFileSync("db/schema.sql", `-- Generado con: npm run db:export-sql\n${SCHEMA_SQL.trim()}\n`);
console.log("Esquema exportado a db/schema.sql");
