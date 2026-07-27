-- MoodDiary — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query)

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

comment on table users is 'Telegram users who opened the MoodDiary mini app';

-- ============================================================
-- mood_entries
-- ============================================================
create table if not exists mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  mood_emoji text not null,
  note text,
  created_at timestamptz not null default now(),
  constraint mood_entries_user_date_unique unique (user_id, date),
  constraint mood_entries_mood_emoji_check check (mood_emoji in ('😄', '😐', '😢', '😡', '🥱'))
);

comment on table mood_entries is 'One mood entry per user per calendar date';

create index if not exists mood_entries_user_date_idx on mood_entries (user_id, date desc);

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
