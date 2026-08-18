
-- ============================================================
-- B2B vendor rate import - batch 4 (August 2026)
-- Source: vendor replies to contact@viakashmir.com ("Hotel Onboarding
-- for Via Kashmir" outreach) and Stay Pattern / Voyager Hotels B2B
-- newsletters, INBOX May-Aug 2026. Run AFTER schema.sql + migrations
-- 0001-0004. Idempotent.
-- All rows approved = true so they appear on the public board.
-- Some properties quote multiple seasons; the active/nearest season is
-- stored in columns, alternates are summarized in notes.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- Hotel Fifth Season, Pahalgam
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_fifth_season_pahalgam', 'Hotel Fifth Season, Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Opp. Govt. Hr. Sec. School, Chandanwari Road, Pahalgam, Anantnag, J&K', '+919797318287', '+919797318287', 'reservations@hotelfifthseason.in', 'www.hotelfifthseason.in',
   '300m from River Lidder with forest views; central heating. B2B tariff valid 1 Jan-31 Oct 2026.', '{"Central Heating"}', true, '2026-01-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_fifth_season_pah_1', 'hotel_fifth_season_pahalgam', 'Deluxe Room', 'Deluxe', 'CP', 2700, 3000, 3500, 4000, 400, 800, 'as_applicable', 'Double occ. Extra bed EP/CP/MAP/AP Rs 600/800/1000/1200. CWOB(>5yr) free/400/600/800.', 5, 'Available', 3000, 400),
  ('rm_hotel_fifth_season_pah_2', 'hotel_fifth_season_pahalgam', 'Super Deluxe Room', 'Super Deluxe', 'CP', 3200, 3500, 4000, 4500, 400, 800, 'as_applicable', 'Double occ. Same extra bed/CWOB scale as Deluxe.', 5, 'Available', 3500, 400),
  ('rm_hotel_fifth_season_pah_3', 'hotel_fifth_season_pahalgam', 'Family Room', 'Family', 'CP', 4100, 4700, 5700, 6700, 400, 800, 'as_applicable', 'Quad occ. Same extra bed/CWOB scale as Deluxe.', 3, 'Available', 4700, 400)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Lake Victoria Houseboats (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_lake_victoria_houseboats', 'Lake Victoria Houseboats', 3, 'srinagar', 'Srinagar', 'houseboat',
   'Dal Lake, Srinagar, J&K', '+919797787777', '+919797787777', '', '',
   'Houseboat stay on Dal Lake, Srinagar. Contact Gul Mohammad.', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_lake_victoria_hb_1', 'hotel_lake_victoria_houseboats', 'Houseboat Room', 'Deluxe', 'MAP', 0, 0, 3800, 0, 0, 1000, 'as_applicable', 'MAPAI (all-inclusive) rate; extra person Rs 1000.', 3, 'Available', 3800, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Welcome Resort, Pahalgam
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_welcome_resort_pahalgam', 'Welcome Resort, Pahalgam', 4, 'pahalgam', 'Pahalgam', 'hotel',
   'KP Road, Langanbal, Pahalgam, J&K 192126', '+919070710107', '+919070710107', 'info@welcomeresort.in', 'www.welcomeresort.in',
   'Resort on Lidder River/Tulian Mountain in Pahalgam with luxury cottages and suites; central heating. Rates for 01 Jul-31 Aug 2026 shown; Oct-Nov rates higher (see partner rate sheet).', '{"Free WiFi","Central Heating","Mountain View"}', true, '2026-07-01', '2026-08-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_welcome_resort_pah_1', 'hotel_welcome_resort_pahalgam', 'Deluxe Premium Room', 'Deluxe', 'MAP', 0, 6500, 7500, 0, 1500, 3000, 'included', 'CP extra bed/CWB/CNB Rs 2000/1500/1000. Oct-Nov CP/MAP Rs 8000/9500.', 5, 'Available', 7500, 1500),
  ('rm_hotel_welcome_resort_pah_2', 'hotel_welcome_resort_pahalgam', 'Deluxe Premium Room with Balcony', 'Deluxe', 'MAP', 0, 7000, 8500, 0, 1500, 3000, 'included', 'Oct-Nov CP/MAP Rs 9500/11000.', 5, 'Available', 8500, 1500),
  ('rm_hotel_welcome_resort_pah_3', 'hotel_welcome_resort_pahalgam', 'Cottage Super Deluxe', 'Cottage', 'MAP', 0, 8500, 10000, 0, 1500, 3000, 'included', 'Lidder River/Tulian Mountain facing. Oct-Nov CP/MAP Rs 10000/12000.', 3, 'Available', 10000, 1500),
  ('rm_hotel_welcome_resort_pah_4', 'hotel_welcome_resort_pahalgam', 'Executive Suite', 'Suite', 'MAP', 0, 9500, 11000, 0, 1500, 3000, 'included', 'Oct-Nov CP/MAP Rs 10500/12500.', 3, 'Available', 11000, 1500),
  ('rm_hotel_welcome_resort_pah_5', 'hotel_welcome_resort_pahalgam', 'Family Suite (Interconnected, Quad)', 'Suite', 'MAP', 0, 14000, 17000, 0, 1500, 3000, 'included', 'Oct-Nov CP/MAP Rs 15000/18000.', 2, 'Available', 17000, 1500),
  ('rm_hotel_welcome_resort_pah_6', 'hotel_welcome_resort_pahalgam', 'Luxury Cottage (Villa)', 'Cottage', 'MAP', 0, 14000, 17000, 0, 1500, 3000, 'included', 'Lidder River/Tulian Mountain facing villa. Oct-Nov CP/MAP Rs 17000/19000.', 2, 'Available', 17000, 1500)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Lupin Gulmarg (M/S Voyage)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_lupin_gulmarg', 'Lupin Gulmarg', 4, 'gulmarg', 'Gulmarg', 'hotel',
   'Outer Circular Road, Gulmarg, Baramulla 193403', '+918493921726', '+919103388207', 'stay@voyagehotels.in', 'www.lupingulmarg.in',
   'Boutique hotel on Outer Circular Road, Gulmarg (M/S Voyage). Dry premises, BYOB. Rates inclusive of GST, valid 01 Jul-30 Sep 2026.', '{}', true, '2026-07-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_lupin_gulmarg_1', 'hotel_lupin_gulmarg', 'Premier Room', 'Deluxe', 'MAP', 0, 6000, 7000, 9000, 0, 2000, 'included', 'Extra bed (above 12yr) CP/MAP/AP Rs 1500/2000/3000; 6-12yr Rs 1000/1500/2500; below 6 free.', 6, 'Available', 7000, 0),
  ('rm_hotel_lupin_gulmarg_2', 'hotel_lupin_gulmarg', 'Family Room', 'Family', 'MAP', 0, 8000, 10000, 13000, 0, 2000, 'included', 'Max occupancy 4.', 6, 'Available', 10000, 0),
  ('rm_hotel_lupin_gulmarg_3', 'hotel_lupin_gulmarg', 'Junior Suite', 'Suite', 'MAP', 0, 7000, 8000, 10000, 0, 2000, 'included', '', 2, 'Available', 8000, 0),
  ('rm_hotel_lupin_gulmarg_4', 'hotel_lupin_gulmarg', 'Skyfall Suite / Honeymoon Suite', 'Suite', 'MAP', 0, 7500, 8500, 10500, 0, 2000, 'included', '', 1, 'Available', 8500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Sindh Resorts & Spa, Sonamarg
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_sindh_resorts_sonamarg', 'Sindh Resorts & Spa, Sonamarg', 4, 'sonamarg', 'Sonamarg', 'hotel',
   'Srinagar-Leh Highway, Sonamarg, Ganderbal, J&K 191202', '+919596755421', '+919596755421', 'reservation@sindhresorts.com', '',
   '49-room resort in Sonamarg with mountain/river view rooms and presidential cottages; spa currently under maintenance. Rates valid Aug-Oct 2026.', '{"Spa","Restaurant","Mountain View","River View"}', true, '2026-08-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_sindh_resorts_som_1', 'hotel_sindh_resorts_sonamarg', 'Premium Deluxe (Mountain View)', 'Deluxe', 'MAP', 0, 10000, 12000, 13500, 2000, 3000, 'as_applicable', '', 8, 'Available', 12000, 2000),
  ('rm_hotel_sindh_resorts_som_2', 'hotel_sindh_resorts_sonamarg', 'Premium Delight (River View)', 'Deluxe', 'MAP', 0, 11500, 13000, 14000, 2000, 3000, 'as_applicable', '', 8, 'Available', 13000, 2000),
  ('rm_hotel_sindh_resorts_som_3', 'hotel_sindh_resorts_sonamarg', 'Executive Suite', 'Suite', 'MAP', 0, 22000, 25000, 27000, 2000, 3000, 'as_applicable', 'River & mountain view.', 4, 'Available', 25000, 2000),
  ('rm_hotel_sindh_resorts_som_4', 'hotel_sindh_resorts_sonamarg', 'Presidential Cottage', 'Cottage', 'MAP', 0, 65000, 80000, 87000, 2000, 3500, 'as_applicable', '', 2, 'Available', 80000, 2000),
  ('rm_hotel_sindh_resorts_som_5', 'hotel_sindh_resorts_sonamarg', 'Presidential Hut (3-Bedroom Cottage)', 'Cottage', 'MAP', 0, 99000, 110000, 125000, 3000, 5000, 'as_applicable', '', 1, 'Available', 110000, 3000)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Pinus Resort, Pahalgam
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_pinus_resort_pahalgam', 'The Pinus Resort, Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Nunwan, Pahalgam, J&K 192126', '+919797780774', '+919797780774', '', 'www.thepinusresort.com',
   'Dry premises resort at Nunwan, Pahalgam. Net rates valid from 1 Apr 2026.', '{}', true, '2026-04-01', null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_pinus_resort_pah_1', 'hotel_pinus_resort_pahalgam', 'Deluxe Room', 'Deluxe', 'CP', 2000, 2300, 2800, 0, 700, 900, 'as_applicable', 'EP/CP/MAP extra bed Rs 800/900/1000; child (CWB) Rs 600/700/800.', 5, 'Available', 2300, 700)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Pahalgam Hill Side Resort & SPA
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_hillside_resort_spa_pahalgam', 'Pahalgam Hill Side Resort & SPA', 4, 'pahalgam', 'Pahalgam', 'hotel',
   'New Market, Anantnag, Pahalgam, J&K', '+918899971555', '+918899971555', 'reservations.hillsideresort@gmail.com', '',
   'Resort with jacuzzi suite in Pahalgam; spa temporarily closed. Rates 1 Jul-15 Oct 2026 shown; 15 Oct 2026-15 Mar 2027 higher (see partner rate sheet). Rates incl GST.', '{"Mountain View","Garden"}', true, '2026-07-01', '2026-10-15')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_hillside_resort_pah_1', 'hotel_hillside_resort_spa_pahalgam', 'Standard (Garden/Mountain View)', 'Standard', 'MAP', 0, 4500, 5500, 0, 1000, 0, 'included', 'Double occ only, no extra bed. Winter (15Oct-15Mar) CPAI/MAPAI Rs 5500/6500.', 4, 'Available', 5500, 1000),
  ('rm_hotel_hillside_resort_pah_2', 'hotel_hillside_resort_spa_pahalgam', 'Deluxe (Ground Floor)', 'Deluxe', 'MAP', 0, 5500, 6500, 0, 1000, 1500, 'included', 'Winter CPAI/MAPAI Rs 6500/7500.', 6, 'Available', 6500, 1000),
  ('rm_hotel_hillside_resort_pah_3', 'hotel_hillside_resort_spa_pahalgam', 'Premium (1st/2nd Floor)', 'Premium', 'MAP', 0, 7500, 9000, 0, 1000, 1500, 'included', 'Winter CPAI/MAPAI Rs 8500/10000.', 12, 'Available', 9000, 1000),
  ('rm_hotel_hillside_resort_pah_4', 'hotel_hillside_resort_spa_pahalgam', 'Luxury Suite with Jacuzzi (Mountain View)', 'Suite', 'MAP', 0, 12000, 14000, 0, 1000, 1500, 'included', 'Winter CPAI/MAPAI Rs 14000/16000.', 4, 'Available', 14000, 1000)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Vista Hotel, Sonamarg
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_vista_sonamarg', 'The Vista Hotel, Sonamarg', 3, 'sonamarg', 'Sonamarg', 'hotel',
   'River Side Valley, Sonamarg, J&K 191202', '+918491000990', '+918491000990', 'thevista.sonamarg@gmail.com', 'www.thevistasonamarg.com',
   'Riverside hotel in Sonamarg. Rates shown for 11 Aug-30 Nov 2026 (current season); Yatra (28 Jun-10 Aug) flat Rs 6000/7000/8000 EP/CP/MAP all rooms; spring (Apr-Jun) similar to current. GST extra.', '{"River View"}', true, '2026-08-11', '2026-11-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_vista_sonamarg_1', 'hotel_vista_sonamarg', 'Super Delux', 'Deluxe', 'CP', 4500, 5500, 6000, 0, 0, 1700, 'extra', '', 4, 'Available', 5500, 0),
  ('rm_hotel_vista_sonamarg_2', 'hotel_vista_sonamarg', 'Delux Room', 'Deluxe', 'CP', 4500, 5000, 6000, 0, 0, 1700, 'extra', '', 4, 'Available', 5000, 0),
  ('rm_hotel_vista_sonamarg_3', 'hotel_vista_sonamarg', 'Family Suite', 'Suite', 'CP', 10000, 11500, 14000, 0, 0, 1700, 'extra', '', 2, 'Available', 11500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel The Kabo, Srinagar
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_the_kabo_srinagar', 'Hotel The Kabo, Srinagar', 4, 'srinagar', 'Srinagar', 'hotel',
   'Opposite Tagore Hall, Wazir Bagh, Srinagar 190001', '+911942313401', '+917006300032', 'sales@thekabo.com', 'www.thekabo.com',
   'Boutique hotel in Wazir Bagh, Srinagar with rooftop restaurant and banquet hall. Off-season net non-commissionable rates valid 1 Jul-31 Dec 2026; 18% GST extra.', '{"Restaurant","Free WiFi","Banquet Hall","Rooftop"}', true, '2026-07-01', '2026-12-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_the_kabo_srinagar_1', 'hotel_the_kabo_srinagar', 'Superior Deluxe Room', 'Deluxe', 'MAP', 0, 7000, 8500, 10500, 1500, 3000, 'extra', '18% GST extra. Extra person (12+) CP/MAP/AP Rs 2000/3000/4000; child 6-12 w/bed Rs 1500/2000/3000, no bed Rs 1000/1500/2500.', 8, 'Available', 8500, 1500),
  ('rm_hotel_the_kabo_srinagar_2', 'hotel_the_kabo_srinagar', 'Luxury Suite Room (Jacuzzi)', 'Suite', 'MAP', 0, 11000, 13000, 15000, 1500, 3000, 'extra', '18% GST extra.', 2, 'Available', 13000, 1500)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Pine Spring, Gulmarg
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_pine_spring_gulmarg', 'Hotel Pine Spring, Gulmarg', 3, 'gulmarg', 'Gulmarg', 'hotel',
   'Next to Gondola, Gulmarg, J&K', '+919797779785', '', 'info@hotelpinespring.com', 'www.hotelpinespring.com',
   'Part of the Hotel Pine Spring group (also Pahalgam and Nigeen Srinagar). MAP-only rates for Apr-Sep 2026.', '{}', true, '2026-04-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_pine_spring_gul_1', 'hotel_pine_spring_gulmarg', 'Deluxe Rooms', 'Deluxe', 'MAP', 0, 0, 10500, 0, 2000, 4000, 'as_applicable', 'Double occ. Extra bed above 9yr; CWOB 5-9yr.', 5, 'Available', 10500, 2000),
  ('rm_hotel_pine_spring_gul_2', 'hotel_pine_spring_gulmarg', 'Premium Room Balcony', 'Premium', 'MAP', 0, 0, 11500, 0, 2000, 4000, 'as_applicable', 'Double occ.', 5, 'Available', 11500, 2000),
  ('rm_hotel_pine_spring_gul_3', 'hotel_pine_spring_gulmarg', 'Luxury Apharwat View', 'Luxury', 'MAP', 0, 0, 13000, 0, 2000, 4000, 'as_applicable', 'Double occ.', 3, 'Available', 13000, 2000)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Pine Spring, Pahalgam
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_pine_spring_pahalgam', 'Hotel Pine Spring, Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Laripora, Pahalgam, J&K', '+919797779785', '', 'info@hotelpinespring.com', 'www.hotelpinespring.com',
   'Part of the Hotel Pine Spring group. Only C Block (basic deluxe) is currently open; main block under construction. MAP-only rates Apr-Sep 2026.', '{}', true, '2026-04-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_pine_spring_pah_1', 'hotel_pine_spring_pahalgam', 'Deluxe Rooms', 'Deluxe', 'MAP', 0, 0, 7000, 0, 2000, 3000, 'as_applicable', 'Only C Block (basic deluxe) open; main block under construction. Double occ, extra bed above 9yr.', 4, 'Available', 7000, 2000)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Elegance in Nigeen, Srinagar
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_elegance_nigeen_srinagar', 'Elegance in Nigeen, Srinagar', 3, 'srinagar', 'Srinagar', 'hotel',
   'Nigeen, Hazratbal, Srinagar, J&K', '+919797779785', '', 'info@hotelpinespring.com', '',
   'Part of the Hotel Pine Spring group, on Nigeen Lake. MAP-only rates Apr-Sep 2026.', '{"Lake View"}', true, '2026-04-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_elegance_nigeen_1', 'hotel_elegance_nigeen_srinagar', 'Superior Rooms', 'Superior', 'MAP', 0, 0, 9000, 0, 2000, 4000, 'as_applicable', 'Double occ.', 5, 'Available', 9000, 2000),
  ('rm_hotel_elegance_nigeen_2', 'hotel_elegance_nigeen_srinagar', 'Executive Suite Room', 'Suite', 'MAP', 0, 0, 12000, 0, 2000, 4000, 'as_applicable', 'Double occ.', 2, 'Available', 12000, 2000)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Hills Heaven, Pahalgam (Voyager Hotels)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_hills_heaven_pahalgam', 'Hotel Hills Heaven, Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Lidroo, Pahalgam, J&K 192126', '+916006672685', '+916006672685', 'hillsheavenpahalgam@gmail.com', 'www.hillsheaven.in',
   'Centrally heated hotel in a private garden at Lidroo, Pahalgam (Voyager Hotels group). Net non-commissionable rates valid 15 Jul 2026-05 Mar 2027.', '{"Central Heating"}', true, '2026-07-15', '2027-03-05')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_hills_heaven_pah_1', 'hotel_hills_heaven_pahalgam', 'Deluxe Double Bedroom', 'Deluxe', 'CP', 1800, 2200, 2500, 3000, 0, 800, 'non_commissionable', 'Extra bed EP/CP/MAP/AP Rs 500/800/1200/1600.', 6, 'Available', 2200, 0),
  ('rm_hotel_hills_heaven_pah_2', 'hotel_hills_heaven_pahalgam', 'Deluxe Family Room', 'Family', 'CP', 3000, 3800, 5000, 6000, 0, 1200, 'non_commissionable', 'Same extra bed scale.', 3, 'Available', 3800, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Holiday Villa, Srinagar (Voyager Hotels)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_holiday_villa_srinagar', 'Holiday Villa, Srinagar', 3, 'srinagar', 'Srinagar', 'hotel',
   'Badu Bagh, Khanyar, Opp Girls Higher Secondary School, Srinagar 190003', '+917006307889', '+919796859992', 'holidayvillasgr@gmail.com', 'www.holidayvilla.in',
   'Voyager Hotels property in Khanyar, Srinagar. Net non-commissionable season rates 1 Jul-30 Sep 2026 shown; rack rate EP/CP/MAP/AP Rs 4999/5499/6299/6999 (Deluxe Double). AC charge Rs 500 extra.', '{}', true, '2026-07-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_holiday_villa_srg_1', 'hotel_holiday_villa_srinagar', 'Deluxe Double Bedroom', 'Deluxe', 'CP', 1800, 2200, 2500, 3000, 0, 1000, 'non_commissionable', 'Rack rate EP/CP/MAP/AP Rs 4999/5499/6299/6999. Extra bed EP/CP/MAP/AP Rs 400/600/1000/1200. AC charge Rs 500 extra.', 6, 'Available', 2200, 0),
  ('rm_hotel_holiday_villa_srg_2', 'hotel_holiday_villa_srinagar', 'Deluxe Family Room', 'Family', 'CP', 3000, 3800, 5000, 6000, 0, 1000, 'non_commissionable', 'Rack rate EP/CP/MAP/AP Rs 6999/7599/8599/9599.', 3, 'Available', 3800, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Lake Walk Suites, Srinagar
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_lake_walk_suites_srinagar', 'Lake Walk Suites, Srinagar', 3, 'srinagar', 'Srinagar', 'hotel',
   'Foreshore Road, Shahdad Bagh, Near Duck Park, Srinagar 190006', '+919541123124', '+919419003282', 'reservations@lakewalksuites.in', 'www.lakewalksuites.in',
   'Suites near Dal Lake at Shahdad Bagh, Srinagar. Contracted rates valid 1 May-30 Oct 2026, exclusive of taxes.', '{"Lake View"}', true, '2026-05-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_lake_walk_suites_1', 'hotel_lake_walk_suites_srinagar', 'Premier Rooms', 'Deluxe', 'CP', 5500, 6000, 7000, 0, 800, 1800, 'extra', 'Rates exclusive of taxes.', 5, 'Available', 6000, 800),
  ('rm_hotel_lake_walk_suites_2', 'hotel_lake_walk_suites_srinagar', 'Premier Room with Balcony (LMV)', 'Deluxe', 'CP', 5800, 6500, 8000, 0, 800, 1800, 'extra', 'Lake & mountain view balcony.', 4, 'Available', 6500, 800),
  ('rm_hotel_lake_walk_suites_3', 'hotel_lake_walk_suites_srinagar', 'Premier Suites (Lake & Mountain View)', 'Suite', 'CP', 6300, 7000, 9000, 0, 800, 1800, 'extra', '', 2, 'Available', 7000, 800)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Brooklyn Resorts (Dehwathu, Ganderbal)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_brooklyn_resorts', 'Hotel Brooklyn Resorts', 3, 'sonamarg', 'Sonamarg', 'hotel',
   'Dehwathu, Ganderbal, J&K', '+918082434905', '+918899066455', '', '',
   'Budget resort near Dehwathu on the Srinagar-Sonamarg road. B2B rates from April 2026.', '{}', true, '2026-04-01', null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_brooklyn_resorts_1', 'hotel_brooklyn_resorts', 'Standard Room', 'Standard', 'MAP', 2000, 2400, 2800, 0, 400, 800, 'as_applicable', 'EP extra bed Rs 400/CNB free; CP extra bed Rs 500/CNB Rs 300; MAP extra bed Rs 800/CNB Rs 400.', 5, 'Available', 2400, 400)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- North Cliff Domes, Sonamarg (Stay Pattern)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_north_cliff_domes_sonamarg', 'North Cliff Domes, Sonamarg', 4, 'sonamarg', 'Sonamarg', 'hotel',
   'Sonamarg Road, Sonamarg, J&K', '+919906990554', '+919622333330', 'info@staypattern.com', '',
   'Four luxury domes on a 4-acre riverside property along the River Sindh, Sonamarg (Stay Pattern). Rates valid till 30 Jun 2026.', '{"Mountain View","River View"}', true, null, '2026-06-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_north_cliff_domes_1', 'hotel_north_cliff_domes_sonamarg', 'Elegant Domes - Riverside', 'Dome', 'CP', 0, 4250, 5250, 0, 0, 0, 'included', 'CPAI incl welcome drink & taxes; MAPAI adds dinner.', 4, 'Available', 4250, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Wood Venture Residency, Srinagar (Stay Pattern)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_wood_venture_residency_srinagar', 'Wood Venture Residency, Srinagar', 2, 'srinagar', 'Srinagar', 'hotel',
   'Near Lal Chowk, Srinagar, J&K', '+919906990553', '+919622333330', 'info@staypattern.com', '',
   'Budget stay near Lal Chowk, Srinagar (Stay Pattern). Rates valid till 30 Jun 2026, inclusive of taxes.', '{}', true, null, '2026-06-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_wood_venture_res_1', 'hotel_wood_venture_residency_srinagar', 'Standard Room', 'Standard', 'EP', 999, 0, 0, 0, 0, 0, 'included', 'Room only.', 4, 'Available', 999, 0),
  ('rm_hotel_wood_venture_res_2', 'hotel_wood_venture_residency_srinagar', 'Deluxe Non-AC Room', 'Deluxe', 'EP', 1199, 0, 0, 0, 0, 0, 'included', 'Room only.', 4, 'Available', 1199, 0),
  ('rm_hotel_wood_venture_res_3', 'hotel_wood_venture_residency_srinagar', 'Deluxe AC Room', 'Deluxe', 'EP', 1499, 0, 0, 0, 0, 0, 'included', 'Room only.', 3, 'Available', 1499, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Shaw Inn, Gulmarg (Stay Pattern)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_shaw_inn_gulmarg', 'The Shaw Inn, Gulmarg', 4, 'gulmarg', 'Gulmarg', 'hotel',
   'Gulmarg, J&K', '+919469999933', '+919469999933', 'sales@staypattern.com', '',
   'Resort at 8,825ft in Gulmarg with games room, multi-cuisine restaurant and lawn (Stay Pattern). Rates valid till 30 Oct 2026.', '{"Restaurant","Games Room","Lawn"}', true, null, '2026-10-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_shaw_inn_gulmarg_1', 'hotel_shaw_inn_gulmarg', 'Premier Room (Ground Floor)', 'Premier', 'MAP', 0, 0, 7999, 0, 0, 0, 'included', 'Extra person up to 5yr free, 5-12yr Rs 2000(no bed)/2500(with bed), above 12yr Rs 3000(with bed only).', 4, 'Available', 7999, 0),
  ('rm_hotel_shaw_inn_gulmarg_2', 'hotel_shaw_inn_gulmarg', 'Premier Room', 'Premier', 'MAP', 0, 0, 8999, 0, 0, 0, 'included', 'Same extra person policy.', 4, 'Available', 8999, 0),
  ('rm_hotel_shaw_inn_gulmarg_3', 'hotel_shaw_inn_gulmarg', 'Super Premier Room', 'Super Premier', 'MAP', 0, 0, 9999, 0, 0, 0, 'included', 'Same extra person policy.', 3, 'Available', 9999, 0),
  ('rm_hotel_shaw_inn_gulmarg_4', 'hotel_shaw_inn_gulmarg', 'Family Room (4 Adults)', 'Family', 'MAP', 0, 0, 15999, 0, 0, 0, 'included', 'Rate for 4 adults.', 2, 'Available', 15999, 0),
  ('rm_hotel_shaw_inn_gulmarg_5', 'hotel_shaw_inn_gulmarg', 'Luxury Family Room with Balcony (4 Adults)', 'Family', 'MAP', 0, 0, 17999, 0, 0, 0, 'included', 'Rate for 4 adults, private balcony.', 1, 'Available', 17999, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Aurum Luxury Collection - Dal View, Srinagar (Stay Pattern)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_aurum_luxury_dal_view_srinagar', 'The Aurum Luxury Collection - Dal View, Srinagar', 5, 'srinagar', 'Srinagar', 'hotel',
   'Zabarwan Hills, Srinagar, J&K', '+919906990554', '+919906990554', 'info@staypattern.com', '',
   'Hillside luxury boutique overlooking Dal Lake in the Zabarwan hills, Srinagar (Stay Pattern). Package valid Jul-Nov.', '{"Lake View","Restaurant","Free WiFi"}', true, '2026-07-01', '2026-11-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_aurum_luxury_dal_1', 'hotel_aurum_luxury_dal_view_srinagar', 'Fully Furnished AC Luxury Bedroom', 'Luxury', 'MAP', 0, 0, 7500, 0, 0, 0, 'included', 'Package: 2N/3D for INR 15,000 total (incl breakfast, dinner, taxes, 1hr Shikara ride, sedan airport pickup, one child under 10 free). Per-night value shown; complimentary upgrade to Elegant Chalet subject to availability.', 3, 'Available', 7500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Outlook, Pahalgam
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_outlook_pahalgam', 'Hotel Outlook, Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Pahalgam, J&K', '+916005307207', '+916005307207', 'reservations@hoteloutlook.in', 'www.hoteloutlook.in',
   'B2B partner hotel in Pahalgam. Rates valid 1 Jul-30 Sep 2026, GST extra.', '{}', true, '2026-07-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_outlook_pahalgam_1', 'hotel_outlook_pahalgam', 'Standard Room', 'Standard', 'CP', 2000, 2500, 3200, 0, 0, 1200, 'extra', 'Extra bed EP/CP/MAP Rs 800/1200/1500. Child below 5yr complimentary.', 5, 'Available', 2500, 0),
  ('rm_hotel_outlook_pahalgam_2', 'hotel_outlook_pahalgam', 'Deluxe Room', 'Deluxe', 'CP', 2500, 3000, 3800, 0, 0, 1300, 'extra', 'Extra bed EP/CP/MAP Rs 900/1300/1600.', 5, 'Available', 3000, 0),
  ('rm_hotel_outlook_pahalgam_3', 'hotel_outlook_pahalgam', 'Executive Room', 'Executive', 'CP', 3000, 3500, 4200, 0, 0, 2000, 'extra', 'Extra bed EP/CP/MAP Rs 1000/1500/2000.', 3, 'Available', 3500, 0),
  ('rm_hotel_outlook_pahalgam_4', 'hotel_outlook_pahalgam', 'Family Room', 'Family', 'CP', 4000, 5000, 6000, 0, 0, 2000, 'extra', 'Extra bed EP/CP/MAP Rs 1000/1500/2000.', 2, 'Available', 5000, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

commit;
