-- JatinSitDown — Supabase schema for laptop <-> phone sync (Phase 3).
-- Run this in the Supabase SQL editor once, then set VITE_SUPABASE_URL and
-- VITE_SUPABASE_ANON_KEY in your .env and redeploy. Auth is magic-link only.
--
-- Every table is scoped to the signed-in user via row-level security, so the
-- anon key is safe to ship in the client.

create table if not exists days (
  user_id uuid not null references auth.users (id) on delete cascade,
  date text not null,
  verified boolean not null default false,
  minutes integer not null default 0,
  completed_at bigint not null default 0,
  primary key (user_id, date)
);

create table if not exists atom_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  atom_id text not null,
  repetitions integer not null default 0,
  ef double precision not null default 2.5,
  interval_days integer not null default 0,
  due_date text not null,
  last_reviewed text,
  consecutive_failures integer not null default 0,
  introduced boolean not null default false,
  updated_at bigint not null default 0,
  primary key (user_id, atom_id)
);

create table if not exists chunk_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  song_id text not null,
  chunk_id text not null,
  reps integer not null default 0,
  best_accuracy double precision not null default 0,
  max_clean_tempo double precision not null default 0,
  clean_days jsonb not null default '[]',
  owned boolean not null default false,
  updated_at bigint not null default 0,
  primary key (user_id, key)
);

-- Row-level security: each user sees and writes only their own rows.
alter table days enable row level security;
alter table atom_progress enable row level security;
alter table chunk_progress enable row level security;

do $$
declare t text;
begin
  foreach t in array array['days', 'atom_progress', 'chunk_progress'] loop
    execute format($f$
      drop policy if exists "own rows" on %1$I;
      create policy "own rows" on %1$I
        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
    $f$, t);
  end loop;
end $$;
