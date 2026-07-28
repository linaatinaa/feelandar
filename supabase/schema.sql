-- Seavy — Supabase schema (v2: multi-mood entries + habits + expenses)
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query)
-- for a FRESH install. If you already ran the v1 schema against a live
-- project, use supabase/migrations/002_add_habits_expenses_multi_mood.sql
-- instead — it upgrades in place without losing existing data.

create extension if not exists "pgcrypto";

-- ============================================================
-- users
-- ============================================================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  created_at timestamptz not null default now()
);

comment on table users is 'Telegram users who opened the Seavy mini app';

-- ============================================================
-- mood_entries
-- ============================================================
-- One row per user per calendar date. A day can carry more than one mood
-- (mood_emojis), an optional short "what are you up to" line (doing), and
-- an optional longer freeform note (story).
create table if not exists mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  mood_emojis text[] not null,
  doing text,
  story text,
  created_at timestamptz not null default now(),
  constraint mood_entries_user_date_unique unique (user_id, date),
  constraint mood_entries_mood_emojis_not_empty check (array_length(mood_emojis, 1) > 0),
  constraint mood_entries_mood_emojis_valid check (
    mood_emojis <@ array['😄','🥰','😌','🤩','😐','🥱','😢','😡','😰','🤒']::text[]
  )
);

comment on table mood_entries is 'One mood entry per user per calendar date, holding 1+ mood emoji plus optional doing/story text';

create index if not exists mood_entries_user_date_idx on mood_entries (user_id, date desc);

-- ============================================================
-- habits
-- ============================================================
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  emoji text not null,
  created_at timestamptz not null default now()
);

comment on table habits is 'User-defined daily habits to track';

create index if not exists habits_user_idx on habits (user_id);

-- ============================================================
-- habit_logs
-- ============================================================
-- One row per habit per date it was marked done. Absence of a row = not done.
create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  constraint habit_logs_unique unique (habit_id, date)
);

comment on table habit_logs is 'Marks a habit as completed on a given date';

create index if not exists habit_logs_user_date_idx on habit_logs (user_id, date desc);
create index if not exists habit_logs_habit_date_idx on habit_logs (habit_id, date);

-- ============================================================
-- expenses
-- ============================================================
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  label text not null,
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);

comment on table expenses is 'Simple per-date expense log (amount in whole Rupiah)';

create index if not exists expenses_user_date_idx on expenses (user_id, date desc);

-- ============================================================
-- Row Level Security
-- ============================================================
-- The API is the only client that talks to Supabase, and it always uses the
-- service_role key (server-side only, never exposed to the browser/mini app).
-- The service_role key bypasses RLS by design, so enabling RLS here with no
-- policies simply guarantees that no other key (e.g. the anon key, if it ever
-- leaked) can read or write these tables directly.
alter table users enable row level security;
alter table mood_entries enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table expenses enable row level security;
