-- Run this on your existing Supabase project AFTER schema.sql.
-- Adds property_type to hotels; migrates any legacy 'houseboats' location rows.

alter table public.hotels
  add column if not exists property_type text not null default 'hotel';

update public.hotels
  set location = 'srinagar',
      location_label = 'Srinagar',
      property_type = 'houseboat'
  where location = 'houseboats';

-- Refresh PostgREST schema cache so the new column is available to the API immediately.
notify pgrst, 'reload schema';
