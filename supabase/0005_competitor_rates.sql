-- ============================================================
-- 0005: Competitor rate reference (MakeMyTrip / Goibibo)
-- Run in Supabase Dashboard → SQL Editor.
--
-- These are admin-entered reference prices, not live-scraped data —
-- MMT/Goibibo block automated scraping and there's no public rate API
-- for either, so the workflow is: admin clicks the compare link, reads
-- the price off the OTA's page, types it in here to set the B2B rate
-- against it. mmt_url/goibibo_url just make that link one click.
-- ============================================================

alter table public.rooms
  add column if not exists mmt_price     int not null default 0,
  add column if not exists goibibo_price int not null default 0,
  add column if not exists competitor_updated_at timestamptz;

alter table public.hotels
  add column if not exists mmt_url     text not null default '',
  add column if not exists goibibo_url text not null default '';

notify pgrst, 'reload schema';
