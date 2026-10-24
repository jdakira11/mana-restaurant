-- Generado con: npm run db:export-sql
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  status text not null check (status in ('pending','confirmed','declined','cancelled','completed','no_show')),
  reservation_date date not null,
  start_minutes integer not null check (start_minutes between 0 and 1439),
  duration_minutes integer not null check (duration_minutes between 15 and 600),
  party_size integer not null check (party_size between 1 and 100),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  notes text,
  manage_token_hash text not null unique,
  idempotency_key text unique,
  privacy_accepted_at timestamptz not null,
  status_changed_at timestamptz,
  status_changed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reservations_date_status_idx on reservations (reservation_date, status);
create index if not exists reservations_email_idx on reservations (lower(customer_email));

create table if not exists reservation_blocks (
  id uuid primary key default gen_random_uuid(),
  block_date date not null,
  start_minutes integer check (start_minutes between 0 and 1440),
  end_minutes integer check (end_minutes between 0 and 1440),
  reason text,
  created_at timestamptz not null default now(),
  constraint reservation_blocks_range check (
    (start_minutes is null and end_minutes is null)
    or (start_minutes is not null and end_minutes is not null and end_minutes > start_minutes)
  )
);
create index if not exists reservation_blocks_date_idx on reservation_blocks (block_date);

create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, window_start)
);

create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references reservations(id) on delete cascade,
  event text not null,
  recipient text not null check (recipient in ('customer','restaurant')),
  status text not null check (status in ('sent','failed','skipped')),
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists notification_log_reservation_idx on notification_log (reservation_id);

alter table reservations enable row level security;
alter table reservation_blocks enable row level security;
alter table app_settings enable row level security;
alter table rate_limits enable row level security;
alter table notification_log enable row level security;
