-- ============================================================
-- B2B vendor rate import — 8 hotels with complete rates
-- Source: vendor replies forwarded to info.hudace@gmail.com (Jun 2026)
-- Run AFTER schema.sql + migrations 0001-0004, in Supabase Dashboard
-- → SQL Editor. Idempotent: re-running updates the same rows.
--
-- All rows are inserted with approved = true so they appear on the
-- public board immediately. inventory defaults to 5 per room type —
-- adjust per hotel once real allotments are known.
--
-- Meal plans: EP = room only, CP = +breakfast, MAP = +breakfast+dinner,
-- AP = all meals. Seasonal hotels store the CURRENT season's rates in
-- columns and the alternate season in notes.
-- ============================================================

begin;

-- ─────────────────────────────────────────────────────────────
-- 1. Hotel Brown Palace Resort — Srinagar (rates exclude GST)
-- ─────────────────────────────────────────────────────────────
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved)
values
  ('hotel_brown_palace', 'Hotel Brown Palace Resort', 3, 'srinagar', 'Srinagar', 'hotel',
   'Srinagar, J&K', '+917889450645', '+917889450645', 'info@hotelbrownpalace.com', 'www.hotelbrownpalace.com',
   'Resort in Srinagar. B2B rates exclude GST. Reservations: Sajid Khan.', '{}', true)
on conflict (id) do update set
  name=excluded.name, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, approved=excluded.approved, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status)
values
  ('rm_brown_deluxe',  'hotel_brown_palace', 'Deluxe Room', 'Deluxe', 'MAP', 4400, 5000, 5800, 0, 700, 1900, 'extra',
   'Extra bed EP/CP/MAP ₹1300/1600/1900. Child without bed (<=5y) ₹0/500/700. Rates exclude GST.', 5, 'Available'),
  ('rm_brown_family',  'hotel_brown_palace', 'Family Suite', 'Suite', 'MAP', 6500, 7500, 8500, 0, 700, 1900, 'extra',
   'Rates exclude GST.', 5, 'Available'),
  ('rm_brown_premium', 'hotel_brown_palace', 'Premium Room (Hot & Cold A.C.)', 'Super Deluxe', 'MAP', 7000, 8000, 9000, 0, 700, 1900, 'extra',
   'Hot & Cold A.C. Rates exclude GST.', 5, 'Available'),
  ('rm_brown_single',  'hotel_brown_palace', 'Single Occupancy (STD/DBL)', 'Standard', 'MAP', 2900, 3300, 4000, 0, 0, 0, 'extra',
   'Single occupancy. Rates exclude GST.', 5, 'Available')
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status, updated_at=now();

-- ─────────────────────────────────────────────────────────────
-- 2. The Sarai — Srinagar (Harwan) · valid 01 Jul – 15 Oct 2026
-- ─────────────────────────────────────────────────────────────
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_the_sarai', 'The Sarai - Srinagar', 4, 'srinagar', 'Srinagar', 'hotel',
   'Sheikh Sarai Hospitality, Harwan, Near Fisheries Office, Srinagar, J&K 191121',
   '+919622994955', '+919622994955', 'reservation@thesarai.in', 'www.thesarai.in',
   'GSTIN 01AEWFS1677M1ZC. General Manager P.C. Thakur. Check-in 14:00, check-out 12:00.', '{}', true,
   '2026-07-01', '2026-10-15')
on conflict (id) do update set
  name=excluded.name, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status)
values
  ('rm_sarai_premium', 'hotel_the_sarai', 'Premium Room', 'Deluxe', 'MAP', 4500, 4800, 5500, 0, 1500, 2000, 'as_applicable',
   'Extra bed EP/CP/MAP ₹1500/1800/2000. CNB ₹800/1200/1500. GST as applicable.', 5, 'Available'),
  ('rm_sarai_club',    'hotel_the_sarai', 'Club Premium', 'Super Deluxe', 'MAP', 5000, 5500, 6500, 0, 1500, 2000, 'as_applicable',
   'Extra bed EP/CP/MAP ₹1500/1800/2000. CNB ₹800/1200/1500.', 5, 'Available'),
  ('rm_sarai_royal',   'hotel_the_sarai', 'Royal Suite', 'Suite', 'MAP', 8000, 9000, 10000, 0, 1500, 2000, 'as_applicable',
   'Extra bed EP/CP/MAP ₹1500/1800/2000. CNB ₹800/1200/1500.', 5, 'Available'),
  ('rm_sarai_family',  'hotel_the_sarai', 'Family Suite', 'Suite', 'MAP', 13000, 15000, 17000, 0, 1500, 2000, 'as_applicable',
   'Extra bed EP/CP/MAP ₹1500/1800/2000. CNB ₹800/1200/1500.', 5, 'Available')
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status, updated_at=now();

-- ─────────────────────────────────────────────────────────────
-- 3. German Residency (The Limewood) — Srinagar
--    Columns hold Jun–Sep 2026 rates; Apr–May in notes
-- ─────────────────────────────────────────────────────────────
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_german_residency', 'German Residency (The Limewood)', 3, 'srinagar', 'Srinagar', 'hotel',
   'The Limewood, Munawarabad, Srinagar, J&K 190008',
   '+918899980777', '+918899980777', 'germanresidency@thelimewood.com', 'www.thelimewood.com',
   'Part of The Limewood group (3 Srinagar properties). Rates may be revised; taxes & service charges apply.', '{}', true,
   '2026-06-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status)
values
  ('rm_german_deluxe', 'hotel_german_residency', 'Deluxe', 'Deluxe', 'MAP', 2400, 2700, 3300, 0, 600, 900, 'extra',
   'Jun–Sep 2026 rates. Apr–May 2026: EP/CP/MAP ₹2500/3000/3500. Extra person >10y 500/700/900, >5y 300/500/600, <5y FOC.', 5, 'Available'),
  ('rm_german_super',  'hotel_german_residency', 'Super Deluxe', 'Super Deluxe', 'MAP', 2800, 3300, 3800, 0, 600, 900, 'extra',
   'Jun–Sep 2026 rates. Apr–May 2026: EP/CP/MAP ₹3000/3500/4000.', 5, 'Available'),
  ('rm_german_suite',  'hotel_german_residency', 'Suite', 'Suite', 'MAP', 3300, 3800, 4300, 0, 600, 900, 'extra',
   'Jun–Sep 2026 rates. Apr–May 2026: EP/CP/MAP ₹3500/4000/4500.', 5, 'Available')
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status, updated_at=now();

-- ─────────────────────────────────────────────────────────────
-- 4. Floating Heaven Heritage Houseboats — Srinagar (Nigeen Lake)
--    Columns hold peak (Apr–Sep) rates; off-season in notes
-- ─────────────────────────────────────────────────────────────
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_floating_heaven', 'Floating Heaven Heritage Houseboats', 3, 'srinagar', 'Srinagar', 'houseboat',
   'Nigeen Lake, Opp. Ashai Bagh Bridge, Ghat No. 2, Srinagar 190006',
   '+918803357716', '+918803357716', 'floatingheaven@gmail.com', '',
   'Heritage houseboats on Nigeen Lake. Owner Mushtaq Dunoo. Alt +91 7889954509; landline 0194-2415049.', '{}', true,
   '2026-04-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status)
values
  ('rm_floating_deluxe', 'hotel_floating_heaven', 'Deluxe Room (2 Pax)', 'Houseboat Deluxe', 'MAP', 4000, 5000, 6000, 0, 1300, 1500, 'as_applicable',
   'Peak (Apr–Sep) rates. Off-season (12 Jan–31 Mar): EP/CP/MAP ₹3000/3500/4000, extra person 1000/1200/1500, child 6-11y 500/1000/1200. Peak extra person 1000/1300/1500; child 6-11y 500/1000/1300.', 5, 'Available')
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status, updated_at=now();

-- ─────────────────────────────────────────────────────────────
-- 5. Hotel Royal Plaza (Aziz Group) — Srinagar · valid till 15 Jul 2026
-- ─────────────────────────────────────────────────────────────
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_royal_plaza', 'Hotel Royal Plaza, Srinagar', 3, 'srinagar', 'Srinagar', 'hotel',
   '3RMC+2Q, Bishember Nagar, Chinar Bagh, Srinagar, J&K 190002',
   '+919469001989', '+919469001989', 'reservations.royalplaza@gmail.com', 'www.hotelroyalplazasrinagar.com',
   'A proud member of the Aziz Group of Hotels. GST 01ABGFR6296J1ZW. Reservations: Ifra Mukhtar / Ubaid Hamid (+91 9484254044).', '{}', true,
   '2026-06-01', '2026-07-15')
on conflict (id) do update set
  name=excluded.name, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status)
values
  ('rm_royal_deluxe', 'hotel_royal_plaza', 'Deluxe Room', 'Deluxe', 'MAP', 0, 0, 3500, 3500, 800, 1200, 'as_applicable',
   'Deluxe @ ₹3500 per room/night (MAP / AI). Extra bed ₹1200; CNB ₹800. 50% advance at booking; balance 7 days before arrival.', 5, 'Available')
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status, updated_at=now();

-- ─────────────────────────────────────────────────────────────
-- 6. Lands End Resort — Pahalgam · valid till 30 Sep 2026
-- ─────────────────────────────────────────────────────────────
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_lands_end', 'Lands End Resort, Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Pahalgam, J&K', '+918825050079', '+918825050079', 'landsendresort786@gmail.com', '',
   'Managing Director Mir Asif. Alt +91 7889795669.',
   '{"Mountain View","Free WiFi","Restaurant","Free Parking","24x7 Front Desk","Room Service","Travel Assistance"}', true,
   '2026-06-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status)
values
  ('rm_lands_deluxe', 'hotel_lands_end', 'Deluxe Room', 'Deluxe', 'MAP', 2500, 3000, 3700, 0, 0, 1200, 'as_applicable',
   'Extra bed EP/CP/MAP ₹600/800/1200. Free cancellation up to 7 days prior; within 7 days 1 night retention; no-show 100%.', 5, 'Available')
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status, updated_at=now();

-- ─────────────────────────────────────────────────────────────
-- 7. Harmony Holidays Kashmir — houseboat + hotel rooms
-- ─────────────────────────────────────────────────────────────
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved)
values
  ('hotel_harmony_holidays', 'Harmony Holidays Kashmir', 3, 'srinagar', 'Srinagar', 'houseboat',
   'Srinagar, J&K', '', '', 'harmonyholidayskashmir@gmail.com', '',
   'Offers both houseboat and hotel rooms at B2B rates.', '{}', true)
on conflict (id) do update set
  name=excluded.name, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, email=excluded.email,
  description=excluded.description, approved=excluded.approved, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status)
values
  ('rm_harmony_houseboat', 'hotel_harmony_holidays', 'Houseboat Room', 'Houseboat Deluxe', 'MAP', 3000, 3500, 4000, 0, 0, 600, 'as_applicable',
   'Houseboat room. Extra bed ₹600.', 5, 'Available'),
  ('rm_harmony_hotel',     'hotel_harmony_holidays', 'Hotel Room', 'Deluxe', 'MAP', 2000, 0, 2500, 0, 0, 500, 'as_applicable',
   'Hotel room. Extra bed ₹500.', 5, 'Available')
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status, updated_at=now();

-- ─────────────────────────────────────────────────────────────
-- 8. Elite Residence — location to be confirmed
-- ─────────────────────────────────────────────────────────────
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved)
values
  ('hotel_elite_residence', 'Elite Residence', 3, 'srinagar', 'Srinagar', 'hotel',
   '', '', '', 'hoteleliteresidence@gmail.com', '',
   'Location to be confirmed with vendor.', '{}', true)
on conflict (id) do update set
  name=excluded.name, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, email=excluded.email,
  description=excluded.description, approved=excluded.approved, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status)
values
  ('rm_elite_standard', 'hotel_elite_residence', 'Standard Room', 'Standard', 'MAP', 0, 0, 2500, 0, 600, 1000, 'as_applicable',
   'MAP B2B ₹2500. Extra bed ₹1000; CNB ₹600.', 5, 'Available')
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status, updated_at=now();

commit;

-- Verify:
--   select id, name, location, approved from public.hotels order by name;
--   select hotel_id, type, ep, cp, map_rate, extra_bed from public.rooms order by hotel_id;
