
-- ============================================================
-- B2B vendor rate import - batch 3 (July 2026, Ladakh-heavy)
-- Source: vendor replies to contact@viakashmir.in, INBOX Jul 2026.
-- Run AFTER schema.sql + migrations 0001-0004. Idempotent.
-- All rows approved = true so they appear on the public board.
-- Seasonal properties store the current season in columns and the
-- alternate season(s) in notes. Rates are per email; see notes for
-- GST treatment and extra-bed / child breakdowns.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- The Indus Valley (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_indus_valley_leh', 'The Indus Valley', 5, 'leh', 'Leh', 'hotel',
   'Library Road, Upper Chulung, Leh, Ladakh 194101', '+919906993545', '+919906993545', 'info@theindusvalleyleh.com', 'www.theindusvalleyleh.com',
   'Luxury hotel in Leh with spa, gym and rooftop restro-bar. Net rates (add 18% GST); CP (breakfast) shown, lunch/dinner charged extra (Rs 1500-2000/pax). Season Apr-Oct 2026; winter Nov-Mar in notes.', '{"Spa","Restaurant","Free WiFi","Gym","Rooftop"}', true, '2026-04-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_indus_valley_leh_1', 'hotel_indus_valley_leh', 'Classic', 'Deluxe', 'CP', 0, 13500, 0, 0, 0, 3000, 'extra', 'Net + 18% GST. Winter (Nov-Mar) CP Rs 8500. Extra person Rs 3000.', 5, 'Available', 13500, 0),
  ('rm_hotel_indus_valley_leh_2', 'hotel_indus_valley_leh', 'Family Twin', 'Deluxe', 'CP', 0, 14500, 0, 0, 0, 3000, 'extra', 'Winter CP Rs 9000.', 5, 'Available', 14500, 0),
  ('rm_hotel_indus_valley_leh_3', 'hotel_indus_valley_leh', 'Premiere', 'Super Deluxe', 'CP', 0, 14500, 0, 0, 0, 3000, 'extra', 'Winter CP Rs 9000.', 5, 'Available', 14500, 0),
  ('rm_hotel_indus_valley_leh_4', 'hotel_indus_valley_leh', 'Valley Spa', 'Super Deluxe', 'CP', 0, 16000, 0, 0, 0, 3000, 'extra', 'Winter CP Rs 11500.', 5, 'Available', 16000, 0),
  ('rm_hotel_indus_valley_leh_5', 'hotel_indus_valley_leh', 'The Indus Valley Suite', 'Suite', 'CP', 0, 29500, 0, 0, 0, 3000, 'extra', 'Winter CP Rs 21500.', 3, 'Available', 29500, 0),
  ('rm_hotel_indus_valley_leh_6', 'hotel_indus_valley_leh', 'Grande Suite (One Bedroom)', 'Executive Suite', 'CP', 0, 46500, 0, 0, 0, 3000, 'extra', 'Winter CP Rs 36500.', 2, 'Available', 46500, 0),
  ('rm_hotel_indus_valley_leh_7', 'hotel_indus_valley_leh', 'Grande Suite (Two Bedrooms)', 'Presidential Suite', 'CP', 0, 62500, 0, 0, 0, 3000, 'extra', 'Winter CP Rs 46500.', 1, 'Available', 62500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Cedar Pahalgam (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_cedar_pahalgam', 'The Cedar Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Pahalgam, J&K', '', '', 'info@thecedarpahalgam.com', '',
   'Hotel in Pahalgam.', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_cedar_pahalgam_1', 'hotel_cedar_pahalgam', 'Deluxe Room', 'Deluxe', 'MAP', 2000, 2300, 2800, 3200, 500, 900, 'as_applicable', 'Extra bed EP/CP/MAP/AP Rs 500/700/900/1500. CNB Rs 500 (every plan).', 5, 'Available', 2300, 500)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Ladakh Eco Resort (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_ladakh_eco_resort', 'Ladakh Eco Resort', 4, 'leh', 'Leh', 'hotel',
   'Spurka, Gangles, Leh, Ladakh 194101', '', '', 'reservation@ladakhecoresort.com', 'www.ladakhecoresort.com',
   '15-cabin sustainable rammed-earth eco resort near Leh. Peak (Jun-Jul) rates in columns; lean (May, Aug-Oct) in notes. Rates incl taxes.', '{"Free WiFi","Restaurant","Mountain View"}', true, '2026-04-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_ladakh_eco_resort_1', 'hotel_ladakh_eco_resort', 'Lungmar Cabin', 'Cottage', 'MAP', 5250, 6930, 10620, 13452, 0, 0, 'included', 'Peak (Jun-Jul), double occ. Lean (May,Aug-Oct): EP/CP/MAP/AP Rs 4725/6405/10030/12862.', 7, 'Available', 6930, 0),
  ('rm_hotel_ladakh_eco_resort_2', 'hotel_ladakh_eco_resort', 'Rgyalung Cabin', 'Cottage', 'MAP', 5775, 7455, 11210, 14042, 0, 0, 'included', 'Peak, double occ. Lean: Rs 5250/6930/10620/13452.', 6, 'Available', 7455, 0),
  ('rm_hotel_ladakh_eco_resort_3', 'hotel_ladakh_eco_resort', 'Karakoram Suite', 'Suite', 'MAP', 10620, 12508, 15340, 18172, 0, 0, 'included', 'Double occ, incl taxes.', 2, 'Available', 12508, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Akbar Sonamarg (Sonamarg)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_akbar_sonamarg', 'Hotel Akbar Sonamarg', 4, 'sonamarg', 'Sonamarg', 'hotel',
   'Sonamarg, Kashmir 191203', '+919910701786', '+919910701786', 'sales@hotelakbarsonamarg.com', 'www.hotelakbarsonamarg.com',
   'Hotel in Sonamarg. Special rates 01 Apr 2026-31 Mar 2027 (EPAI/CPAI/MAPAI/APAI). Higher Amarnath Yatra rates in notes. Tel 0194-2417243.', '{}', true, '2026-04-01', '2027-03-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_akbar_sonamarg_1', 'hotel_akbar_sonamarg', 'Standard Room', 'Standard', 'MAP', 4000, 4000, 4500, 6500, 1000, 1800, 'as_applicable', 'Amarnath Yatra: EP/CP/MAP/AP Rs 5000/5500/6000/8000. EB EP/CP/MAP/AP Rs 1200/1500/1800/2500. CWOB Rs 500/700/1000/1500.', 5, 'Available', 4000, 1000),
  ('rm_hotel_akbar_sonamarg_2', 'hotel_akbar_sonamarg', 'Deluxe', 'Deluxe', 'MAP', 5000, 5500, 6000, 7500, 1000, 1800, 'as_applicable', 'Amarnath Yatra: Rs 6000/6600/7800/9000.', 5, 'Available', 5500, 1000),
  ('rm_hotel_akbar_sonamarg_3', 'hotel_akbar_sonamarg', 'Premium', 'Super Deluxe', 'MAP', 6000, 6500, 7000, 8500, 1000, 1800, 'as_applicable', 'Amarnath Yatra: Rs 7000/7600/8800/10000.', 5, 'Available', 6500, 1000),
  ('rm_hotel_akbar_sonamarg_4', 'hotel_akbar_sonamarg', 'Suite', 'Suite', 'MAP', 13000, 13600, 14800, 16000, 1000, 1800, 'as_applicable', 'Amarnath Yatra: Rs 14000/14600/15800/17000.', 2, 'Available', 13600, 1000)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Lidder Resorts (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_lidder_resorts_pahalgam', 'Lidder Resorts', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Pahalgam, J&K', '', '', 'sales.lidderresorts@gmail.com', '',
   'Resort in Pahalgam (Lidder). Reservations: Abbas Bhatt.', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_lidder_resorts_pah_1', 'hotel_lidder_resorts_pahalgam', 'Deluxe Room', 'Deluxe', 'MAP', 2200, 2500, 3000, 0, 0, 1200, 'as_applicable', 'Extra bed EP/CP/MAP Rs 800/1000/1200.', 5, 'Available', 2500, 0),
  ('rm_hotel_lidder_resorts_pah_2', 'hotel_lidder_resorts_pahalgam', 'Family Room', 'Suite', 'MAP', 0, 0, 5500, 0, 0, 1200, 'as_applicable', 'Family room MAP.', 5, 'Available', 5500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Marina Gulmarg (Gulmarg)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_marina_gulmarg', 'Hotel Marina Gulmarg', 3, 'gulmarg', 'Gulmarg', 'hotel',
   'Near Drung Water Fall, Tangmarg, Gulmarg, J&K', '+918899880077', '+918899880077', 'info@hotelmarina.in', '',
   'Hotel Marina by Stay Pattern, Drung, Gulmarg. Rates valid up to 30 Oct 2026, breakfast only (CP). Welcome drink, Wi-Fi.', '{"Free WiFi"}', true, null, '2026-10-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_marina_gulmarg_1', 'hotel_marina_gulmarg', 'Premium Room (River View)', 'Deluxe', 'CP', 0, 3500, 0, 0, 0, 0, 'as_applicable', 'Breakfast only (CP).', 5, 'Available', 3500, 0),
  ('rm_hotel_marina_gulmarg_2', 'hotel_marina_gulmarg', 'Super Premium (Drung Waterfall View)', 'Super Deluxe', 'CP', 0, 4500, 0, 0, 0, 0, 'as_applicable', 'Waterfall view. Breakfast only.', 5, 'Available', 4500, 0),
  ('rm_hotel_marina_gulmarg_3', 'hotel_marina_gulmarg', 'Suite Room', 'Suite', 'CP', 0, 5500, 0, 0, 0, 0, 'as_applicable', 'Breakfast only.', 3, 'Available', 5500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Le Mentok Retreat (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_le_mentok_leh', 'Le Mentok Retreat', 4, 'leh', 'Leh', 'hotel',
   'Leh, Ladakh', '', '', 'lementok@gmail.com', '',
   'Le Mentok Retreat, Leh. Tariff 2026 (double occupancy). GST extra (12% cottage, 18% duplex). Extra bed 40% of double. Contact: Lobzang Shamshu.', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_le_mentok_leh_1', 'hotel_le_mentok_leh', 'Cottage', 'Cottage', 'MAP', 0, 7280, 8990, 12420, 0, 0, 'extra', 'Double occ. Single CP/MAP/AP Rs 6664/7990/8680. +12% GST. Extra bed 40% of double.', 5, 'Available', 7280, 0),
  ('rm_hotel_le_mentok_leh_2', 'hotel_le_mentok_leh', 'Duplex', 'Suite', 'MAP', 0, 12835, 16970, 21112, 0, 0, 'extra', 'Duplex. +18% GST. Extra bed 40%.', 3, 'Available', 12835, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Victory Hotel (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_the_victory_srinagar', 'The Victory Hotel', 3, 'srinagar', 'Srinagar', 'hotel',
   'Kursoo Rajbagh, Near IGNOU Center, Rajbagh, Srinagar 190008', '+919796319104', '+919796319104', 'info@thevictory.in', 'www.thevictory.in',
   'Hotel in Rajbagh, Srinagar. Off-season rates 01 Jul-30 Sep 2026 (exclude 5% GST). Winter (Oct-Feb) higher in notes. Child <5 free.', '{"Central Heating","AC","24x7 Hot Water","Restaurant"}', true, '2026-07-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_the_victory_srinag_1', 'hotel_the_victory_srinagar', 'Premium Double Deluxe', 'Deluxe', 'MAP', 0, 1900, 2500, 3500, 600, 900, 'extra', 'Exclude 5% GST. Winter CP/MAP/AP Rs 2200/3000/4000. EB CP/MAP/AP Rs 700/900/1200. CWOB Rs 400/600/1000.', 5, 'Available', 1900, 600),
  ('rm_hotel_the_victory_srinag_2', 'hotel_the_victory_srinagar', 'Executive Suite Room (2 Pax)', 'Suite', 'MAP', 0, 2500, 3500, 4500, 600, 900, 'extra', 'Winter Rs 3000/4000/5000.', 3, 'Available', 2500, 600),
  ('rm_hotel_the_victory_srinag_3', 'hotel_the_victory_srinagar', 'Quad Sharing Room (4 Pax)', 'Suite', 'MAP', 0, 5000, 6500, 7000, 600, 900, 'extra', '4 persons.', 2, 'Available', 5000, 600)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Chospa Hotel (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_chospa_leh', 'Chospa Hotel', 4, 'leh', 'Leh', 'hotel',
   'Old Leh Road, Leh, Ladakh', '+918494013328', '+918494013328', 'sales@chospahotel.com', '',
   '17-room boutique hotel on Old Leh Road, sustainable Ladakhi architecture. Summer rates 01 Apr-30 Sep 2026, 15% commissionable, +18% GST. Check-in 12:00 / out 09:00. All rooms club category.', '{"Free WiFi","Restaurant"}', true, '2026-04-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_chospa_leh_1', 'hotel_chospa_leh', 'Club Room', 'Deluxe', 'MAP', 0, 16500, 19800, 21450, 0, 4000, 'extra', 'Double occ, +18% GST, 15% commissionable. Single CP/MAP/AP Rs 14500/15500/17000. Extra bed +B/+B+D/+all Rs 3000/4000/4500. Incl welcome drink & wifi.', 17, 'Available', 16500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Ayum Resort Ladakh (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_ayum_ladakh', 'Ayum Resort Ladakh', 3, 'leh', 'Leh', 'hotel',
   'Leh, Ladakh', '+919103274877', '+919103274877', 'ayumladakh@gmail.com', '',
   'Apple-orchard resort in Ladakh, 12 premium rooms. Operational to mid-Oct 2026. Child <6 free.', '{"Free WiFi","Garden"}', true, null, '2026-10-15')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_ayum_ladakh_1', 'hotel_ayum_ladakh', 'Premium Room', 'Super Deluxe', 'MAP', 0, 6000, 7000, 8200, 1200, 3100, 'as_applicable', 'Double occ (CPAI/MAPAI/APAI). Single Rs 5600/6500/7400. EB CP/MAP Rs 2500/3100. CWOB Rs 800/1200.', 12, 'Available', 6000, 1200)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Shambhala Resort Leh (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_shambhala_leh', 'Shambhala Resort Leh', 3, 'leh', 'Leh', 'hotel',
   'Skara, Near Zorawar Fort, Leh, Ladakh 194101', '+917901727809', '+917901727809', 'hotels@rvideas.in', 'www.shambhalahotel.com',
   'Resort at Skara, Leh (booking partner rvideas). Season (May,Jun,Jul,Oct) rates in columns; off-season (Apr,Aug,Sep) in notes. Prices incl GST. Extra bed 35%.', '{"Free WiFi","Central Heating"}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_shambhala_leh_1', 'hotel_shambhala_leh', 'Regular Room', 'Standard', 'MAP', 1500, 1920, 2550, 3180, 0, 0, 'included', 'Season, double occ. Off-season EP/CP/MAP/AP Rs 1300/1720/2350/2980. Incl GST. Extra bed 35%.', 2, 'Available', 1920, 0),
  ('rm_hotel_shambhala_leh_2', 'hotel_shambhala_leh', 'Deluxe Room', 'Deluxe', 'MAP', 1950, 2370, 3000, 3670, 0, 0, 'included', 'Season. Off-season Rs 1650/2070/2700/3330.', 12, 'Available', 2370, 0),
  ('rm_hotel_shambhala_leh_3', 'hotel_shambhala_leh', 'Superior Room', 'Super Deluxe', 'MAP', 2350, 2770, 3400, 4030, 0, 0, 'included', 'Season. Off-season Rs 1950/2370/3000/3630.', 10, 'Available', 2770, 0),
  ('rm_hotel_shambhala_leh_4', 'hotel_shambhala_leh', 'Suite Room', 'Suite', 'MAP', 2850, 3270, 3900, 4530, 0, 0, 'included', 'Double occ, season. Triple/Quad higher.', 1, 'Available', 3270, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Latsas, Nubra (Nubra Valley)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_latsas_nubra', 'The Latsas, Nubra', 4, 'leh', 'Nubra Valley', 'hotel',
   'Hunder, Nubra Valley, Ladakh 194401', '+917901727809', '+917901727809', 'hotels@rvideas.in', 'www.thelatsas.in',
   'Luxury guest house in Hunder, Nubra Valley (booking partner rvideas). Season (May,Jun,Jul,Oct) in columns; off-season in notes. Extra bed 35%. Incl GST.', '{"Free WiFi","Mountain View"}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_latsas_nubra_1', 'hotel_latsas_nubra', 'Deluxe Room', 'Deluxe', 'MAP', 1600, 2000, 2600, 3200, 0, 0, 'included', 'Season, double occ. Off-season Rs 1400/1700/2300/2900.', 8, 'Available', 2000, 0),
  ('rm_hotel_latsas_nubra_2', 'hotel_latsas_nubra', 'Deluxe Room (Balcony)', 'Super Deluxe', 'MAP', 1800, 2200, 2800, 3400, 0, 0, 'included', 'With balcony. Off-season Rs 1600/1900/2500/3100.', 3, 'Available', 2200, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Alpine Ridge Gulmarg (Gulmarg)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_alpine_ridge_gulmarg', 'Hotel Alpine Ridge Gulmarg', 4, 'gulmarg', 'Gulmarg', 'hotel',
   'Heevan Retreats Road, Near Gondola, Gulmarg, J&K', '+919796111013', '+919796111013', 'hotelalpineridge@gmail.com', 'www.hotelalpineridge.com',
   'Hotel near Gulmarg Gondola. Season (16 Apr-Sep) rates in columns; Oct-Nov and Dec-15 Apr higher in notes. GST extra. Registered trade discount 15-25%.', '{}', true, '2026-04-16', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_alpine_ridge_gulma_1', 'hotel_alpine_ridge_gulmarg', 'Super Deluxe', 'Super Deluxe', 'MAP', 6250, 6875, 8125, 0, 1500, 2500, 'extra', 'Season 16 Apr-Sep. GST extra. Extra bed EP/CP/MAP Rs 1500/1800/2500. CNB (5-12) Rs 500/800/1500.', 5, 'Available', 6875, 1500),
  ('rm_hotel_alpine_ridge_gulma_2', 'hotel_alpine_ridge_gulmarg', 'Minisuite', 'Suite', 'MAP', 6250, 6600, 8125, 0, 1500, 2500, 'extra', 'Season.', 3, 'Available', 6600, 1500),
  ('rm_hotel_alpine_ridge_gulma_3', 'hotel_alpine_ridge_gulmarg', 'Family Suite', 'Suite', 'MAP', 8125, 8750, 10000, 0, 1500, 2500, 'extra', 'Season.', 2, 'Available', 8750, 1500),
  ('rm_hotel_alpine_ridge_gulma_4', 'hotel_alpine_ridge_gulmarg', 'Luxury Suite', 'Suite', 'MAP', 8125, 8750, 10000, 0, 1500, 2500, 'extra', 'Season.', 2, 'Available', 8750, 1500)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Vista Pahalgam (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_vista_pahalgam', 'Vista Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Laripora, Pahalgam, J&K', '+919906569090', '+919906569090', 'reservation1@vistapahalgam.in', '',
   'Hotel at Laripora, Pahalgam. Special agent rates on MAPAI basis (breakfast + lunch or dinner), valid till 01 Oct 2026.', '{"Free WiFi","LED TV","24x7 Hot Water","Parking"}', true, null, '2026-10-01')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_vista_pahalgam_1', 'hotel_vista_pahalgam', 'Deluxe Room', 'Deluxe', 'MAP', 0, 0, 3500, 0, 0, 1500, 'as_applicable', 'MAPAI (breakfast + lunch or dinner). Child with bed Rs 1000.', 5, 'Available', 3500, 0),
  ('rm_hotel_vista_pahalgam_2', 'hotel_vista_pahalgam', 'Super Deluxe Room', 'Super Deluxe', 'MAP', 0, 0, 4000, 0, 0, 1500, 'as_applicable', 'MAPAI.', 5, 'Available', 4000, 0),
  ('rm_hotel_vista_pahalgam_3', 'hotel_vista_pahalgam', 'Family Room', 'Suite', 'MAP', 0, 0, 6000, 0, 0, 1500, 'as_applicable', 'MAPAI.', 3, 'Available', 6000, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Shel Ladakh (Shey, Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_shel_ladakh', 'Shel Ladakh', 5, 'leh', 'Shey, Leh', 'hotel',
   'Shashi Zampa, Shey, Leh, Ladakh', '', '', 'hajra@shelladakh.com', 'www.shelladakh.com',
   'Exclusive-use luxury villa at Shey, Leh (whole-house booking, all meals incl). Season Apr-Oct 2026, +18% GST, double occ, min 2 nights.', '{"Free WiFi","Garden","Library"}', true, '2026-04-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_shel_ladakh_1', 'hotel_shel_ladakh', 'Exclusive Villa (per night, all meals)', 'Villa', 'AP', 0, 0, 0, 55000, 0, 0, 'extra', 'Entire house, exclusive use, all meals + beverages + laundry + wifi for up to 6 adults. 1/2/3 rooms Rs 55000/85000/105000; +4th room Rs 130000. +18% GST. Double occ, min 2 nights.', 1, 'Available', 55000, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Ladakh Sarai (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_ladakh_sarai', 'Ladakh Sarai', 5, 'leh', 'Leh', 'hotel',
   'Leh, Ladakh', '+919910041685', '+919910041685', 'jigmet@ladakhsarai.com', 'www.ladakhsarai.com',
   'Luxury mud-hut/chalet resort near Leh. Rack rates shown; 25% TAC for agents. Incl taxes, valid 10 Apr-15 Oct 2026. CPAI/MAPI/APAI.', '{"Mountain View","Restaurant"}', true, '2026-04-10', '2026-10-15')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_ladakh_sarai_1', 'hotel_ladakh_sarai', 'Mud Hut', 'Cottage', 'MAP', 0, 15950, 19750, 23350, 5900, 7900, 'included', 'Rack (25% TAC). Double occ. Incl taxes. EB CP/MAP/AP Rs 6300/7900/9350. CWOB (7-12) Rs 4750/5900/7000.', 3, 'Available', 15950, 5900),
  ('rm_hotel_ladakh_sarai_2', 'hotel_ladakh_sarai', 'Chalet', 'Villa', 'MAP', 0, 19100, 23700, 27250, 5900, 7900, 'included', 'Rack (25% TAC), double occ.', 9, 'Available', 19100, 5900),
  ('rm_hotel_ladakh_sarai_3', 'hotel_ladakh_sarai', 'Duplex (4 Pax)', 'Suite', 'MAP', 0, 29300, 38950, 45250, 5900, 7900, 'included', '4 pax. Rack (25% TAC).', 4, 'Available', 29300, 5900)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Zans'ser Sarai (Ladakh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_zansser_sarai', 'Zans''ser Sarai', 5, 'leh', 'Ladakh', 'hotel',
   'Ladakh', '+919910041685', '+919910041685', 'jigmet@ladakhsarai.com', 'www.ladakhsarai.com',
   'Zans''ser Sarai (Ladakh Sarai group). River-facing mud yurts. Rack MAPI shown; 25% TAC. Incl taxes, 10 Apr-15 Oct 2026.', '{"Mountain View"}', true, '2026-04-10', '2026-10-15')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_zansser_sarai_1', 'hotel_zansser_sarai', 'Mud Yurt (River Facing)', 'Camp / Tent', 'MAP', 0, 0, 36900, 0, 9200, 14760, 'included', 'MAPI double (single Rs 31900). Rack, 25% TAC. Incl taxes. CWOB (7-12) Rs 9200.', 7, 'Available', 36900, 9200)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Tara Mountain Sarai (Ladakh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_tara_mountain_sarai', 'Tara Mountain Sarai', 5, 'leh', 'Ladakh', 'hotel',
   'Ladakh', '+919910041685', '+919910041685', 'jigmet@ladakhsarai.com', 'www.ladakhsarai.com',
   'Tara Mountain Sarai (Ladakh Sarai group). River-facing mud yurts. Rack MAPI shown; 25% TAC. Incl taxes, 10 Apr-15 Oct 2026.', '{"Mountain View"}', true, '2026-04-10', '2026-10-15')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_tara_mountain_sara_1', 'hotel_tara_mountain_sarai', 'Mud Yurt (River Facing)', 'Camp / Tent', 'MAP', 0, 0, 36900, 0, 9200, 14760, 'included', 'MAPI double (single Rs 31900). Rack, 25% TAC. Incl taxes.', 7, 'Available', 36900, 9200)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Bombay Palace Pahalgam (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_bombay_palace_pahalgam', 'Hotel Bombay Palace Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Pahalgam, J&K', '', '', 'hotelbombaypalace11@gmail.com', '',
   'Hotel in Pahalgam (20 rooms), centrally heated. Revised FIT rates 01 Jul-30 Sep 2026. Winter (Oct-05 Jan) in notes.', '{"Central Heating"}', true, '2026-07-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_bombay_palace_paha_1', 'hotel_bombay_palace_pahalgam', 'Deluxe Room', 'Deluxe', 'MAP', 2000, 2400, 3000, 0, 700, 1000, 'as_applicable', 'Winter (Oct-Jan): EP/CP/MAP Rs 2500/2800/3500. EB EP/CP/MAP Rs 500/700/1000. CWOB Rs 300/500/700.', 5, 'Available', 2400, 700),
  ('rm_hotel_bombay_palace_paha_2', 'hotel_bombay_palace_pahalgam', 'Super Deluxe Room', 'Super Deluxe', 'MAP', 3000, 3400, 4000, 0, 700, 1000, 'as_applicable', 'Winter Rs 3500/3800/4500.', 5, 'Available', 3400, 700)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Bombay Residency Pahalgam (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_bombay_residency_pahalgam', 'Hotel Bombay Residency Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Pahalgam, J&K', '', '', 'hotelbombaypalace11@gmail.com', '',
   'Hotel in Pahalgam (12 rooms), Bombay group, centrally heated. FIT rates 01 Jul-30 Sep 2026. Winter in notes.', '{"Central Heating"}', true, '2026-07-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_bombay_residency_p_1', 'hotel_bombay_residency_pahalgam', 'Deluxe Luxury', 'Deluxe', 'MAP', 2500, 2800, 3500, 0, 900, 1300, 'as_applicable', 'Winter (Oct-Jan): EP/CP/MAP Rs 3600/4000/4500. EB EP/CP/MAP Rs 500/900/1300. CWOB Rs 400/600/900.', 5, 'Available', 2800, 900),
  ('rm_hotel_bombay_residency_p_2', 'hotel_bombay_residency_pahalgam', 'Premium Luxury', 'Super Deluxe', 'MAP', 3600, 4000, 4500, 0, 900, 1300, 'as_applicable', 'Winter Rs 4600/5000/5500.', 5, 'Available', 4000, 900)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Unalome Resort (Nubra Valley)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_unalome_nubra', 'The Unalome Resort', 4, 'leh', 'Nubra Valley', 'hotel',
   'Nubra Valley, Ladakh', '', '', 'theunalomeresort@gmail.com', '',
   'Boutique luxury resort in Nubra Valley. Season May-Sep 2026, per room, incl GST. (Sheet also listed a secondary lower rate column.)', '{"Restaurant","Garden","Mountain View","24x7 Hot Water","Free WiFi","Parking"}', true, '2026-05-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_unalome_nubra_1', 'hotel_unalome_nubra', 'Deluxe Room', 'Deluxe', 'MAP', 10500, 12000, 15000, 17000, 4500, 6000, 'included', 'Double occ, incl GST. Single EP/CP/MAP/AP Rs 8000/10000/12000/15000. EB (MAP) Rs 6000, CWB Rs 4500. Sheet had a secondary lower rate column.', 5, 'Available', 12000, 4500)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Pride Resort Gulmarg (Gulmarg)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_pride_resort_gulmarg', 'Pride Resort Gulmarg', 4, 'gulmarg', 'Gulmarg', 'hotel',
   'Gulmarg, J&K', '+919906357144', '+919906357144', 'prideresort786@gmail.com', '',
   'Resort in Gulmarg. Rates valid till 31 Oct 2026, double occupancy. Child <6 free. Manager: Nisar Ahmad.', '{}', true, null, '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_pride_resort_gulma_1', 'hotel_pride_resort_gulmarg', 'Super Deluxe', 'Super Deluxe', 'MAP', 0, 11000, 13000, 0, 0, 3500, 'as_applicable', 'Double occ. EB CP/MAP Rs 2500/3500.', 5, 'Available', 11000, 0),
  ('rm_hotel_pride_resort_gulma_2', 'hotel_pride_resort_gulmarg', 'Junior Suite', 'Suite', 'MAP', 0, 14000, 16000, 0, 0, 4000, 'as_applicable', 'EB CP/MAP Rs 3000/4000.', 3, 'Available', 14000, 0),
  ('rm_hotel_pride_resort_gulma_3', 'hotel_pride_resort_gulmarg', 'Executive Suite', 'Executive Suite', 'MAP', 0, 16000, 18000, 0, 0, 4500, 'as_applicable', 'EB CP/MAP Rs 3500/4500.', 2, 'Available', 16000, 0),
  ('rm_hotel_pride_resort_gulma_4', 'hotel_pride_resort_gulmarg', '1BHK Cottage', 'Cottage', 'MAP', 0, 19000, 22000, 0, 0, 4500, 'as_applicable', 'EB CP/MAP Rs 3500/4500.', 2, 'Available', 19000, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Silk Route Ladakh (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_silk_route_ladakh', 'The Silk Route Ladakh', 3, 'leh', 'Leh', 'hotel',
   'Skara, Leh, Ladakh 194101', '+918899115322', '+918899115322', 'thesilkrouteladakh@gmail.com', 'www.hotelthesilkrouteladakh.com',
   'Hotel at Skara, Leh. Tariff 2026-27 (EPAI/CPAI/MAPAI), incl GST. Extra bed 40%. Child <8 free. TAC 30% (May-Sep) / 40% (Oct).', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_silk_route_ladakh_1', 'hotel_silk_route_ladakh', 'Deluxe Room', 'Deluxe', 'MAP', 4500, 5200, 6000, 0, 0, 0, 'included', 'Incl GST. Extra bed 40%.', 5, 'Available', 5200, 0),
  ('rm_hotel_silk_route_ladakh_2', 'hotel_silk_route_ladakh', 'Super Deluxe Room', 'Super Deluxe', 'MAP', 6000, 6700, 7500, 0, 0, 0, 'included', 'Incl GST. Extra bed 40%.', 5, 'Available', 6700, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Ladakh Avenue (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_ladakh_avenue', 'The Ladakh Avenue', 4, 'leh', 'Leh', 'hotel',
   'Karzoo, Near DC Residency, Leh, Ladakh 194101', '+917006194562', '+917006194562', 'theladakhavenue@gmail.com', 'www.ladakhavenuretreat.com',
   'Premium retreat at Karzoo, Leh, 5 min from main market. Rates May-Oct 2026. Extra bed 40%; CWB (6-10) 25%; child <5 free. Check-in 11:00 / out 10:00.', '{"Welcome Drinks","Free WiFi","Restaurant","Parking","Travel Desk","Room Service","Laundry","Mountain View"}', true, '2026-05-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_ladakh_avenue_1', 'hotel_ladakh_avenue', 'Premium Room', 'Super Deluxe', 'MAP', 2700, 3700, 4500, 0, 0, 0, 'as_applicable', 'Private balcony. Extra bed 40%; CWB (6-10) 25%.', 5, 'Available', 3700, 0),
  ('rm_hotel_ladakh_avenue_2', 'hotel_ladakh_avenue', 'Family Room', 'Suite', 'MAP', 4000, 5000, 6000, 0, 0, 0, 'as_applicable', 'Extra bed 40%; CWB 25%.', 3, 'Available', 5000, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Sipa Ladakh (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_sipa_ladakh', 'The Sipa Ladakh', 3, 'leh', 'Leh', 'hotel',
   'Leh, Ladakh', '+919906982581', '+919906982581', 'thesipaladakh@gmail.com', '',
   'Hotel in Leh. Tariff 2026 (01 Apr-31 Oct), +5% GST. Check-in 10:00 / out 08:00. Child 5-10 charged 30% on double without extra bed.', '{}', true, '2026-04-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_sipa_ladakh_1', 'hotel_sipa_ladakh', 'Deluxe Room', 'Deluxe', 'MAP', 2800, 3500, 4000, 0, 0, 1600, 'extra', 'Double occ, +5% GST. Single CP/MAP Rs 3200/3500; EP Rs 2800. EB CP/MAP/EP Rs 1400/1600/1120.', 5, 'Available', 3500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Kloof Orchards Pahalgam (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_kloof_orchards_pahalgam', 'Hotel Kloof Orchards Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Pahalgam, J&K', '+919622219146', '+919622219146', 'sales@klooforchards.com', '',
   'Hotel amid apple orchards, Pahalgam, rooms with balcony. Summer rates 01 Jul-30 Sep 2026. Free upgrade to Super Deluxe Balcony (subject to availability). Family room on request.', '{"Mountain View","Restaurant"}', true, '2026-07-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_kloof_orchards_pah_1', 'hotel_kloof_orchards_pahalgam', 'Deluxe Room', 'Deluxe', 'MAP', 1200, 1400, 1800, 0, 400, 800, 'as_applicable', 'Extra bed EP/CP/MAP Rs 500/600/800. Child no bed CP/MAP Rs 300/400. Free upgrade to Super Deluxe Balcony subject to availability.', 5, 'Available', 1400, 400)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

commit;
