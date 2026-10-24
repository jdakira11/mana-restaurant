import "server-only";
import type { Queryable } from "@/lib/db/client";
import type { Block, OccupyingReservation } from "./availability";
import type { ReservationStatus } from "./request-schema";
import { formatTime } from "./time";

export interface ReservationRecord {
  id: string;
  reference: string;
  status: ReservationStatus;
  date: string;
  time: string;
  startMinutes: number;
  durationMinutes: number;
  partySize: number;
  name: string;
  email: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  statusChangedAt: string | null;
}

interface Row {
  id: string;
  reference: string;
  status: ReservationStatus;
  reservation_date: string;
  start_minutes: number;
  duration_minutes: number;
  party_size: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  created_at: Date | string;
  status_changed_at: Date | string | null;
}

const COLUMNS = `id, reference, status, reservation_date::text as reservation_date, start_minutes, duration_minutes,
  party_size, customer_name, customer_email, customer_phone, notes, created_at, status_changed_at`;

const iso = (v: Date | string | null) => (v === null ? null : new Date(v).toISOString());

function map(r: Row): ReservationRecord {
  return {
    id: r.id,
    reference: r.reference,
    status: r.status,
    date: r.reservation_date,
    time: formatTime(r.start_minutes),
    startMinutes: r.start_minutes,
    durationMinutes: r.duration_minutes,
    partySize: r.party_size,
    name: r.customer_name,
    email: r.customer_email,
    phone: r.customer_phone,
    notes: r.notes,
    createdAt: iso(r.created_at)!,
    statusChangedAt: iso(r.status_changed_at),
  };
}

/** Bloqueo transaccional por fecha: serializa las reservas concurrentes del mismo día. */
export async function lockDate(tx: Queryable, date: string): Promise<void> {
  await tx.query(`select pg_advisory_xact_lock(hashtext($1))`, [`mana:reservations:${date}`]);
}

export async function occupyingReservations(db: Queryable, date: string): Promise<OccupyingReservation[]> {
  const { rows } = await db.query<{ start_minutes: number; duration_minutes: number; party_size: number }>(
    `select start_minutes, duration_minutes, party_size from reservations
     where reservation_date = $1 and status in ('pending','confirmed')`,
    [date],
  );
  return rows.map((r) => ({ startMinutes: r.start_minutes, durationMinutes: r.duration_minutes, partySize: r.party_size }));
}

export async function blocksBetween(db: Queryable, from: string, to: string): Promise<Block[]> {
  const { rows } = await db.query<{ block_date: string; start_minutes: number | null; end_minutes: number | null }>(
    `select block_date::text as block_date, start_minutes, end_minutes from reservation_blocks
     where block_date between $1 and $2`,
    [from, to],
  );
  return rows.map((r) => ({ date: r.block_date, startMinutes: r.start_minutes, endMinutes: r.end_minutes }));
}

export async function findDuplicate(db: Queryable, date: string, email: string, phoneDigits: string): Promise<boolean> {
  const { rows } = await db.query(
    `select 1 from reservations
     where reservation_date = $1 and status in ('pending','confirmed')
       and (lower(customer_email) = lower($2) or regexp_replace(customer_phone, '\\D', '', 'g') = $3)
     limit 1`,
    [date, email, phoneDigits],
  );
  return rows.length > 0;
}

export async function findByIdempotencyKey(db: Queryable, key: string): Promise<ReservationRecord | null> {
  const { rows } = await db.query<Row>(`select ${COLUMNS} from reservations where idempotency_key = $1`, [key]);
  return rows[0] ? map(rows[0]) : null;
}

export async function findByManageTokenHash(db: Queryable, hash: string): Promise<ReservationRecord | null> {
  const { rows } = await db.query<Row>(`select ${COLUMNS} from reservations where manage_token_hash = $1`, [hash]);
  return rows[0] ? map(rows[0]) : null;
}

export async function findById(db: Queryable, id: string): Promise<ReservationRecord | null> {
  const { rows } = await db.query<Row>(`select ${COLUMNS} from reservations where id = $1`, [id]);
  return rows[0] ? map(rows[0]) : null;
}

export async function insertReservation(
  db: Queryable,
  data: {
    reference: string;
    status: ReservationStatus;
    date: string;
    startMinutes: number;
    durationMinutes: number;
    partySize: number;
    name: string;
    email: string;
    phone: string;
    notes: string | null;
    manageTokenHash: string;
    idempotencyKey: string;
  },
): Promise<ReservationRecord> {
  const { rows } = await db.query<Row>(
    `insert into reservations (reference, status, reservation_date, start_minutes, duration_minutes, party_size,
       customer_name, customer_email, customer_phone, notes, manage_token_hash, idempotency_key, privacy_accepted_at,
       status_changed_at, status_changed_by)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, now(), case when $2 = 'confirmed' then now() else null end,
       case when $2 = 'confirmed' then 'system:auto' else null end)
     returning ${COLUMNS}`,
    [
      data.reference,
      data.status,
      data.date,
      data.startMinutes,
      data.durationMinutes,
      data.partySize,
      data.name,
      data.email,
      data.phone,
      data.notes,
      data.manageTokenHash,
      data.idempotencyKey,
    ],
  );
  return map(rows[0]);
}

export async function updateStatus(
  db: Queryable,
  id: string,
  from: ReservationStatus[],
  to: ReservationStatus,
  actor: string,
): Promise<ReservationRecord | null> {
  const { rows } = await db.query<Row>(
    `update reservations set status = $2, status_changed_at = now(), status_changed_by = $3, updated_at = now()
     where id = $1 and status = any($4::text[])
     returning ${COLUMNS}`,
    [id, to, actor, from],
  );
  return rows[0] ? map(rows[0]) : null;
}

export interface ReservationFilters {
  date?: string;
  dateTo?: string;
  status?: ReservationStatus | "active" | "all";
  q?: string;
  limit?: number;
}

export async function listReservations(db: Queryable, f: ReservationFilters): Promise<ReservationRecord[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  const add = (sql: string, value: unknown) => {
    params.push(value);
    where.push(sql.replace("?", `$${params.length}`));
  };
  if (f.date && f.dateTo) {
    add("reservation_date >= ?", f.date);
    add("reservation_date <= ?", f.dateTo);
  } else if (f.date) add("reservation_date = ?", f.date);
  if (f.status === "active") where.push(`status in ('pending','confirmed')`);
  else if (f.status && f.status !== "all") add("status = ?", f.status);
  if (f.q) {
    params.push(`%${f.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);
    const p = `$${params.length}`;
    where.push(`(customer_name ilike ${p} or customer_email ilike ${p} or customer_phone ilike ${p} or reference ilike ${p})`);
  }
  params.push(Math.min(f.limit ?? 200, 500));
  const { rows } = await db.query<Row>(
    `select ${COLUMNS} from reservations ${where.length ? `where ${where.join(" and ")}` : ""}
     order by reservation_date asc, start_minutes asc, created_at asc limit $${params.length}`,
    params,
  );
  return rows.map(map);
}

export async function logNotification(
  db: Queryable,
  entry: { reservationId: string; event: string; recipient: "customer" | "restaurant"; status: "sent" | "failed" | "skipped"; detail?: string },
): Promise<void> {
  await db.query(
    `insert into notification_log (reservation_id, event, recipient, status, detail) values ($1,$2,$3,$4,$5)`,
    [entry.reservationId, entry.event, entry.recipient, entry.status, entry.detail?.slice(0, 500) ?? null],
  );
}

export async function notificationsFor(db: Queryable, reservationIds: string[]) {
  if (reservationIds.length === 0) return [];
  const { rows } = await db.query<{ reservation_id: string; event: string; recipient: string; status: string; detail: string | null; created_at: Date | string }>(
    `select reservation_id, event, recipient, status, detail, created_at from notification_log
     where reservation_id = any($1::uuid[]) order by created_at asc`,
    [reservationIds],
  );
  return rows;
}
