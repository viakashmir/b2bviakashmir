-- ============================================================
-- Via Kashmir B2B Rate Portal — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- HOTELS
create table if not exists public.hotels (
  id              text primary key,
  name            text not null,
  stars           int  not null default 3 check (stars between 1 and 5),
  location        text not null,
  location_label  text not null,
  address         text not null default '',
  phone           text not null default '',
  email           text not null default '',
  website         text not null default '',
  description     text not null default '',
  amenities       text[] not null default array[]::text[],
  approved        boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ROOMS (rates + inventory)
create table if not exists public.rooms (
  id          text primary key,
  hotel_id    text not null references public.hotels(id) on delete cascade,
  type        text not null,
  category    text not null,
  meal        text not null,
  double      int  not null default 0,
  cnb         int  not null default 0,
  extra_bed   int  not null default 0,
  inventory   int  not null default 0,
  status      text not null default 'Available',
  updated_at  timestamptz not null default now()
);
create index if not exists rooms_hotel_id_idx on public.rooms(hotel_id);

-- CONCERNS (travel agent → hotel)
create table if not exists public.concerns (
  id                  text primary key,
  hotel_id            text not null,
  hotel_name          text not null,
  agent_name          text not null,
  agent_email         text not null,
  agent_company       text not null default '',
  category            text not null,
  subject             text not null,
  description         text not null,
  status              text not null default 'open',
  priority            text not null default 'medium',
  admin_response      text not null default '',
  admin_response_at   timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- Row Level Security — public reads only; writes go via API routes
-- ============================================================
alter table public.hotels   enable row level security;
alter table public.rooms    enable row level security;
alter table public.concerns enable row level security;

drop policy if exists "public read approved hotels" on public.hotels;
create policy "public read approved hotels"
  on public.hotels for select
  using (approved = true);

drop policy if exists "public read rooms of approved hotels" on public.rooms;
create policy "public read rooms of approved hotels"
  on public.rooms for select
  using (
    exists (
      select 1 from public.hotels h
      where h.id = rooms.hotel_id and h.approved = true
    )
  );

-- Concerns are not publicly readable. Reads happen via API routes
-- with the service-role key after checking Clerk auth.

-- ============================================================
-- Real-time: enable change streams
-- ============================================================
alter publication supabase_realtime add table public.hotels;
alter publication supabase_realtime add table public.rooms;

-- ============================================================
-- updated_at auto-touch
-- ============================================================
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists hotels_touch on public.hotels;
create trigger hotels_touch before update on public.hotels
  for each row execute function public.touch_updated_at();

drop trigger if exists rooms_touch on public.rooms;
create trigger rooms_touch before update on public.rooms
  for each row execute function public.touch_updated_at();

drop trigger if exists concerns_touch on public.concerns;
create trigger concerns_touch before update on public.concerns
  for each row execute function public.touch_updated_at();
