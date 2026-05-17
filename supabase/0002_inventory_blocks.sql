-- Adds calendar-based inventory blocking for the vendor inventory module.
-- A block reserves N rooms of a given room (or all rooms if room_id is null)
-- for a date range. Used to mark OTA bookings, maintenance, holds, etc.

create table if not exists public.inventory_blocks (
  id           text primary key,
  hotel_id     text not null references public.hotels(id) on delete cascade,
  room_id      text references public.rooms(id) on delete cascade, -- null = applies to all rooms in the hotel
  start_date   date not null,
  end_date     date not null,
  block_type   text not null default 'blocked', -- 'blocked' | 'hold' | 'maintenance' | 'ota'
  reason       text not null default '',
  count        int  not null default 1 check (count >= 1),
  source       text not null default 'vendor_manual', -- 'vendor_manual' | 'ical_import'
  ota_name     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists inv_blocks_hotel_idx
  on public.inventory_blocks (hotel_id);
create index if not exists inv_blocks_date_idx
  on public.inventory_blocks (hotel_id, start_date, end_date);

alter table public.inventory_blocks enable row level security;
-- Writes go through API routes with service role; no public select.
-- (No public read policy intentionally — inventory blocks are private to the vendor.)

drop trigger if exists inv_blocks_touch on public.inventory_blocks;
create trigger inv_blocks_touch before update on public.inventory_blocks
  for each row execute function public.touch_updated_at();

-- Add to realtime publication so the calendar page refreshes live.
alter publication supabase_realtime add table public.inventory_blocks;

notify pgrst, 'reload schema';
