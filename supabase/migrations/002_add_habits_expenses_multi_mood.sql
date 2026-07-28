-- Seavy v1 -> v2 migration
-- Run ONCE in the Supabase SQL editor against a database that was created
-- with the original (v1) supabase/schema.sql. It upgrades mood_entries to
-- support multiple moods per day + doing/story text, and adds the new
-- habits, habit_logs, and expenses tables. Existing data is preserved.

-- ============================================================
-- 1) mood_entries: single mood_emoji -> mood_emojis[], note -> story, +doing
-- ============================================================
alter table mood_entries add column if not exists mood_emojis text[];
update mood_entries set mood_emojis = array[mood_emoji] where mood_emojis is null;
alter table mood_entries alter column mood_emojis set not null;

alter table mood_entries add column if not exists doing text;

alter table mood_entries rename column note to story;

alter table mood_entries drop constraint if exists mood_entries_mood_emoji_check;
alter table mood_entries drop column if exists mood_emoji;

alter table mood_entries
  add constraint mood_entries_mood_emojis_not_empty check (array_length(mood_emojis, 1) > 0);
alter table mood_entries
  add constraint mood_entries_mood_emojis_valid check (
    mood_emojis <@ array['😄','🥰','😌','🤩','😐','🥱','😢','😡','😰','🤒']::text[]
  );

-- ============================================================
-- 2) new tables: habits, habit_logs, expenses
-- ============================================================
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  emoji text not null,
  created_at timestamptz not null default now()
);
create index if not exists habits_user_idx on habits (user_id);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  constraint habit_logs_unique unique (habit_id, date)
);
create index if not exists habit_logs_user_date_idx on habit_logs (user_id, date desc);
create index if not exists habit_logs_habit_date_idx on habit_logs (habit_id, date);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  label text not null,
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index if not exists expenses_user_date_idx on expenses (user_id, date desc);

alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table expenses enable row level security;
