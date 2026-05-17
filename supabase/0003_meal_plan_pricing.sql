-- Expands the pricing model to match how real Kashmir hotels publish
-- tariffs (EP/CP/MAP/AP rates, Child WOB, Extra Bed, GST status, notes)
-- and adds a per-hotel tariff validity window.

-- ── ROOMS — meal-plan rates, child WOB, GST, notes ──────────────────────
alter table public.rooms
  add column if not exists ep         int  not null default 0,
  add column if not exists cp         int  not null default 0,
  add column if not exists map_rate   int  not null default 0,  -- 'map' is reserved-ish; use map_rate
  add column if not exists ap         int  not null default 0,
  add column if not exists child_wob  int  not null default 0,  -- Child Without Bed
  add column if not exists gst        text not null default 'as_applicable', -- 'included' | 'extra' | 'as_applicable' | 'non_commissionable'
  add column if not exists notes      text not null default '';

-- Backfill: assume existing 'double' was the CP rate (most common B2B default).
-- Also migrate 'cnb' → 'child_wob' if non-zero.
update public.rooms
  set cp = greatest(cp, double),
      child_wob = greatest(child_wob, cnb)
  where (cp = 0 and double > 0) or (child_wob = 0 and cnb > 0);

-- ── HOTELS — tariff validity window ─────────────────────────────────────
alter table public.hotels
  add column if not exists tariff_start date,
  add column if not exists tariff_end   date;

notify pgrst, 'reload schema';
