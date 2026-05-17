-- ============================================================
-- 0004: WhatsApp contact on hotels + Enquiries log
-- Run in Supabase Dashboard → SQL Editor.
-- ============================================================

-- WhatsApp phone — separate from the public-display phone in case the
-- vendor uses a different number for WhatsApp messages.
alter table public.hotels
  add column if not exists whatsapp_phone text not null default '';

-- Enquiry log — every traveller who hits "Enquire on WhatsApp" creates
-- a row here. Public can INSERT (with no SELECT permission) so admin
-- has a full audit trail without exposing PII to anonymous reads.
create table if not exists public.enquiries (
  id                text primary key,
  hotel_id          text not null,
  hotel_name        text not null,
  traveller_name    text not null,
  traveller_phone   text not null,
  check_in          date,
  check_out         date,
  nights            int  not null default 0,
  rooms             int  not null default 1,
  adults            int  not null default 2,
  children          int  not null default 0,
  notes             text not null default '',
  whatsapp_link     text not null default '',
  created_at        timestamptz not null default now()
);

create index if not exists enquiries_hotel_idx     on public.enquiries(hotel_id);
create index if not exists enquiries_created_idx   on public.enquiries(created_at desc);

-- RLS — enquiries are NEVER publicly readable. All writes also go
-- through the API route (with service-role key) so we never accept
-- spoofed rows from the browser.
alter table public.enquiries enable row level security;

-- No public read/write policies on purpose. Service role bypasses RLS.
