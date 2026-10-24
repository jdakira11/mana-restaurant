import "server-only";
import { defaultReservationSettings } from "@/config/reservations";
import { getDb, type Queryable } from "@/lib/db/client";
import { reservationSettingsSchema, type PublicReservationSettings, type ReservationSettings } from "./settings-schema";

const KEY = "reservations";

/** Ajustes efectivos: los guardados desde el panel tienen prioridad sobre `config/reservations.ts`. */
export async function getReservationSettings(db?: Queryable): Promise<ReservationSettings> {
  const conn = db ?? (await getDb());
  const { rows } = await conn.query<{ value: unknown }>(`select value from app_settings where key = $1`, [KEY]);
  if (!rows[0]) return defaultReservationSettings;
  const parsed = reservationSettingsSchema.safeParse({ ...defaultReservationSettings, ...(rows[0].value as object) });
  if (!parsed.success) {
    console.error("[reservas] Ajustes guardados no válidos; se usan los predeterminados.", parsed.error.issues);
    return defaultReservationSettings;
  }
  return parsed.data;
}

export async function saveReservationSettings(settings: ReservationSettings): Promise<void> {
  const valid = reservationSettingsSchema.parse(settings);
  const db = await getDb();
  await db.query(
    `insert into app_settings (key, value, updated_at) values ($1, $2::jsonb, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [KEY, JSON.stringify(valid)],
  );
}

export async function resetReservationSettings(): Promise<void> {
  const db = await getDb();
  await db.query(`delete from app_settings where key = $1`, [KEY]);
}

export function toPublicSettings(s: ReservationSettings): PublicReservationSettings {
  return { timezone: s.timezone, confirmationMode: s.confirmationMode, partySize: s.partySize, maxDaysAhead: s.maxDaysAhead };
}
