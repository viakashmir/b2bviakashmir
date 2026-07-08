
-- ============================================================
-- B2B vendor rate import - batch 2 (July 2026)
-- Source: vendor replies to contact@viakashmir.in, INBOX Jul 2026.
-- Run AFTER schema.sql + migrations 0001-0004. Idempotent.
-- All rows approved = true so they appear on the public board.
-- Seasonal properties store the current season in columns and the
-- alternate season(s) in notes. Rates are per email; see notes for
-- GST treatment and extra-bed / child breakdowns.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- Hotel Royal Heritage (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_royal_heritage', 'Hotel Royal Heritage', 3, 'srinagar', 'Srinagar', 'hotel',
   'M.A Link Road, Munwarabad, Srinagar, J&K 190001', '+919906578622', '+919906578622', 'reservation@hotelroyalheritage.in', 'www.hotelroyalheritage.in',
   'Hotel at Munwarabad, Srinagar. B2B rates 01 Jul-31 Oct 2026, GST as applicable. Check-in 1400 / check-out 1200. Reservations: Miss Insha (GM).', '{}', true, '2026-07-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_royal_heritage_1', 'hotel_royal_heritage', 'Deluxe / Premium Room', 'Deluxe', 'MAP', 2500, 3000, 3500, 0, 0, 1300, 'as_applicable', 'Extra bed EP/CP/MAP Rs 800/1000/1300. GST as applicable.', 5, 'Available', 3000, 0),
  ('rm_hotel_royal_heritage_2', 'hotel_royal_heritage', 'Family Room', 'Suite', 'MAP', 4000, 5500, 6500, 0, 0, 1300, 'as_applicable', 'Extra bed EP/CP/MAP Rs 800/1000/1300.', 5, 'Available', 5500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Lake View Kashmir (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_lake_view_kashmir', 'Hotel Lake View Kashmir', 4, 'srinagar', 'Srinagar', 'hotel',
   'Boulevard 13, Dal Lake, Srinagar, Kashmir 190001', '+918899900650', '+918899900650', 'reservations@lakeviewkashmir.com', 'www.lakeviewkashmir.com',
   'Lakefront hotel on Boulevard, Dal Lake. Rates include GST and complimentary breakfast; 15% travel-agent discount on standard rates. LV = Lake View, MV = Mountain View. Wellness center, multi-cuisine restaurant, rooftop.', '{"Lake View","Restaurant","Wellness Center","24x7 Hot Water","Garden","Rooftop","Lift","Mini Theatre","24h Reception"}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_lake_view_kashmir_1', 'hotel_lake_view_kashmir', 'Superior Room', 'Deluxe', 'CP', 0, 14500, 16900, 19900, 2000, 2000, 'included', 'Lake View. Mountain View CP/MAP/AP Rs 10500/12900/15900. Incl GST + breakfast.', 5, 'Available', 14500, 2000),
  ('rm_hotel_lake_view_kashmir_2', 'hotel_lake_view_kashmir', 'Premier Room', 'Super Deluxe', 'CP', 0, 16500, 18900, 21900, 2000, 2000, 'included', 'Lake View. Mountain View Rs 13500/15900/18900.', 5, 'Available', 16500, 2000),
  ('rm_hotel_lake_view_kashmir_3', 'hotel_lake_view_kashmir', 'Executive Suite Room', 'Executive Suite', 'CP', 0, 17500, 19900, 22900, 2000, 2000, 'included', 'Lake View only. Incl GST + breakfast.', 5, 'Available', 17500, 2000),
  ('rm_hotel_lake_view_kashmir_4', 'hotel_lake_view_kashmir', 'Premier Family Room', 'Suite', 'CP', 0, 17500, 19900, 22900, 2000, 2000, 'included', 'Lake View. Mountain View Rs 14500/16900/19900.', 5, 'Available', 17500, 2000),
  ('rm_hotel_lake_view_kashmir_5', 'hotel_lake_view_kashmir', 'Suite Room (Balcony)', 'Suite', 'CP', 0, 34900, 37500, 40500, 2000, 2000, 'included', 'Balcony, Lake View. Incl GST + breakfast.', 3, 'Available', 34900, 2000),
  ('rm_hotel_lake_view_kashmir_6', 'hotel_lake_view_kashmir', 'Premier Quad Room', 'Suite', 'CP', 0, 24500, 26900, 29900, 2000, 2000, 'included', 'Quad occupancy, Lake View.', 4, 'Available', 24500, 2000),
  ('rm_hotel_lake_view_kashmir_7', 'hotel_lake_view_kashmir', 'Premier Room (Rooftop)', 'Super Deluxe', 'CP', 0, 19500, 21900, 24900, 2000, 2000, 'included', 'Rooftop, Lake View. Incl GST + breakfast.', 4, 'Available', 19500, 2000)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Rewa Ladakh (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_rewa_ladakh', 'Hotel Rewa Ladakh', 4, 'leh', 'Leh', 'hotel',
   'Skara Road, Opp. Ladakh Public School, Leh, UT Ladakh 194101', '+919419220046', '+919419220046', 'info@hotelrewaladakh.com', 'www.hotelrewaladakh.com',
   '32-room boutique hotel in Leh. B2B rates Apr-Oct 2026, inclusive of GST, net and non-commissionable (offline only). Check-in 12:00 / check-out 10:00. Ops Head: Rinchen. Rates shown are double occupancy.', '{"Free WiFi","Restaurant","Mountain View","Room Service","24h Reception"}', true, '2026-04-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_rewa_ladakh_1', 'hotel_rewa_ladakh', 'Shing Nang Premier Room', 'Deluxe', 'MAP', 6000, 7400, 9800, 12200, 2100, 3650, 'non_commissionable', 'Double occ. Single EP/CP/MAP/AP Rs 6000/6700/7900/9100. Extra adult Rs 1750/2450/3650/4850. CNB Rs 1150/1500/2100/2700. Incl GST.', 7, 'Available', 7400, 2100),
  ('rm_hotel_rewa_ladakh_2', 'hotel_rewa_ladakh', 'Shing Nang Premier Twin Room', 'Deluxe', 'MAP', 6000, 7400, 9800, 12200, 2100, 3650, 'non_commissionable', 'Twin. Double occ. Single Rs 6000/6700/7900/9100.', 6, 'Available', 7400, 2100),
  ('rm_hotel_rewa_ladakh_3', 'hotel_rewa_ladakh', 'Rabsal Luxury Room', 'Super Deluxe', 'MAP', 8000, 9400, 11800, 14200, 2100, 3650, 'non_commissionable', 'Double occ. Single Rs 8000/8700/9900/11100.', 16, 'Available', 9400, 2100),
  ('rm_hotel_rewa_ladakh_4', 'hotel_rewa_ladakh', 'Junior Suite Room', 'Suite', 'MAP', 9500, 10900, 13300, 15700, 2100, 3650, 'non_commissionable', 'Double occ. Single Rs 9500/10200/11400/12600.', 1, 'Available', 10900, 2100),
  ('rm_hotel_rewa_ladakh_5', 'hotel_rewa_ladakh', 'Rabsal Designer Suite Room', 'Executive Suite', 'MAP', 27500, 28900, 31300, 33700, 2100, 3650, 'non_commissionable', 'Double occ. Single Rs 27500/28200/29400/30600.', 2, 'Available', 28900, 2100)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Inter Mountain (Sonamarg)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_inter_mountain_sonamarg', 'Hotel Inter Mountain', 3, 'sonamarg', 'Sonamarg', 'hotel',
   'Sonamarg, J&K', '+919419741718', '+919419741718', 'hotelintermountain@gmail.com', 'hotelintermountain.com',
   'Family-friendly hotel in Sonamarg. Seasonal rates. Contact & bookings 9419741718.', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_inter_mountain_son_1', 'hotel_inter_mountain_sonamarg', 'Deluxe Room', 'Deluxe', 'MAP', 3500, 4000, 4500, 0, 0, 1500, 'as_applicable', 'Peak (to 24 Jul): EB EP/CP/MAP Rs 1000/1250/1500. 25 Jul-15 Aug: EP/CP/MAP Rs 3000/3500/4000 (EB 800/1000/1200). 15 Aug-Nov: Rs 2000/2500/3000 (EB 600/900/1200).', 5, 'Available', 4000, 0),
  ('rm_hotel_inter_mountain_son_2', 'hotel_inter_mountain_sonamarg', 'Family Suite', 'Suite', 'MAP', 5000, 6000, 7000, 0, 0, 1500, 'as_applicable', 'Family suite.', 5, 'Available', 6000, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Hidden Leaf (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_hidden_leaf', 'Hotel Hidden Leaf', 3, 'srinagar', 'Srinagar', 'hotel',
   'Post Office Lane, Near VLCC, Rajbagh, Srinagar 190008', '+916006022990', '+916006022990', 'reservations@hotelhiddenleaf.com', 'hotelhiddenleaf.com',
   'Hotel in Rajbagh, Srinagar. Reservation +91 6006075730.', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_hidden_leaf_1', 'hotel_hidden_leaf', 'Super Deluxe Room', 'Super Deluxe', 'MAP', 1800, 2000, 2200, 0, 0, 800, 'as_applicable', 'Extra bed EP/CP/MAP Rs 500/600/800. Child with bed EP/CP/MAP Rs 300/400/500.', 5, 'Available', 2000, 0),
  ('rm_hotel_hidden_leaf_2', 'hotel_hidden_leaf', 'Family Suite', 'Suite', 'MAP', 3000, 3500, 4000, 0, 0, 800, 'as_applicable', 'Family suite.', 5, 'Available', 3500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Milad (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_milad', 'Hotel Milad', 3, 'srinagar', 'Srinagar', 'hotel',
   'Srinagar, J&K', '+919906693144', '+919906693144', 'info@hotelmilad.com', 'www.hotelmilad.com',
   'Hotel in Srinagar. Special rates July 2026 onwards, exclude GST. Check-in 1400 / out 1200. Reservations: Ms. Aqsa / Sahil Koul (+91 7006323144).', '{}', true, '2026-07-01', null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_milad_1', 'hotel_milad', 'Deluxe AC Room', 'Deluxe', 'MAP', 1800, 2100, 2500, 0, 0, 800, 'extra', 'Extra bed EP/CP/MAP Rs 500/600/800. Rates exclude GST.', 5, 'Available', 2100, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Kashmir Mahal Resorts (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_kashmir_mahal_resorts', 'Kashmir Mahal Resorts', 4, 'srinagar', 'Srinagar', 'hotel',
   'Ishber Nishat, Srinagar 191121, Kashmir', '+919906543333', '+919906543333', 'bookings@kashmirmahalresorts.com', 'www.kashmirmahalresorts.com',
   'Resort at Ishber Nishat. Special rates valid up to 31 Oct 2026 (limited period). CP col = CPAI, MAP col = MAPAI. Extra bed CP/MAP Rs 1500/2000. Child 5-10 sharing Rs 1000/1500; child <5 free. Smoking & alcohol not permitted. Check-in 1400 / out 1200. Sales Director: M. Yaseen.', '{}', true, null, '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_kashmir_mahal_reso_1', 'hotel_kashmir_mahal_resorts', 'Deluxe Room', 'Deluxe', 'MAP', 0, 3500, 4500, 0, 0, 2000, 'as_applicable', 'CPAI/MAPAI. Extra bed CP/MAP Rs 1500/2000.', 5, 'Available', 3500, 0),
  ('rm_hotel_kashmir_mahal_reso_2', 'hotel_kashmir_mahal_resorts', 'Premium Room', 'Super Deluxe', 'MAP', 0, 3800, 4800, 0, 0, 2000, 'as_applicable', 'CPAI/MAPAI.', 5, 'Available', 3800, 0),
  ('rm_hotel_kashmir_mahal_reso_3', 'hotel_kashmir_mahal_resorts', 'Super Premium Room', 'Super Deluxe', 'MAP', 0, 6200, 7200, 0, 0, 2000, 'as_applicable', 'CPAI/MAPAI.', 5, 'Available', 6200, 0),
  ('rm_hotel_kashmir_mahal_reso_4', 'hotel_kashmir_mahal_resorts', 'Premium Cottage with Garden', 'Cottage', 'MAP', 0, 6500, 7500, 0, 0, 2000, 'as_applicable', 'CPAI/MAPAI.', 3, 'Available', 6500, 0),
  ('rm_hotel_kashmir_mahal_reso_5', 'hotel_kashmir_mahal_resorts', 'Family Room (Quad, 4 Adults)', 'Suite', 'MAP', 0, 8500, 10500, 0, 0, 2000, 'as_applicable', 'Quad, 4 adults. CPAI/MAPAI.', 3, 'Available', 8500, 0),
  ('rm_hotel_kashmir_mahal_reso_6', 'hotel_kashmir_mahal_resorts', 'Luxury Family Room (Interconnected, 4 Adults)', 'Suite', 'MAP', 0, 10000, 12000, 0, 0, 2000, 'as_applicable', 'Interconnected 2 rooms, 4 adults.', 2, 'Available', 10000, 0),
  ('rm_hotel_kashmir_mahal_reso_7', 'hotel_kashmir_mahal_resorts', 'Premium Suite with Bathtub', 'Suite', 'MAP', 0, 12000, 13000, 0, 0, 2000, 'as_applicable', 'With bathtub. CPAI/MAPAI.', 2, 'Available', 12000, 0),
  ('rm_hotel_kashmir_mahal_reso_8', 'hotel_kashmir_mahal_resorts', 'Luxury Suite with Jacuzzi', 'Suite', 'MAP', 0, 14500, 16500, 0, 0, 2000, 'as_applicable', 'With jacuzzi. CPAI/MAPAI.', 2, 'Available', 14500, 0),
  ('rm_hotel_kashmir_mahal_reso_9', 'hotel_kashmir_mahal_resorts', 'Luxury Family Suite (4 Adults)', 'Suite', 'MAP', 0, 16000, 18000, 0, 0, 2000, 'as_applicable', '4 adults. CPAI/MAPAI.', 2, 'Available', 16000, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Lee Heritage (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_lee_heritage', 'Lee Heritage', 3, 'srinagar', 'Srinagar', 'hotel',
   'Abiguzar Central Market, Residency Road, Srinagar 190001', '+919622950964', '+919622950964', 'ask@leeheritage.in', 'www.leeheritage.in',
   'Centrally located hotel on Residency Road. Rates 01 Jan-31 Dec 2026, include GST. GST 01AHWPB3253B1ZX. Reservation Manager: Tariq.', '{"Central Heating","AC","24h Reception","Restaurant","Free WiFi","Doctor on Call","Parking"}', true, '2026-01-01', '2026-12-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_lee_heritage_1', 'hotel_lee_heritage', 'Deluxe Room', 'Deluxe', 'MAP', 2500, 2800, 3500, 0, 800, 1500, 'included', 'Incl GST. Extra bed EP/CP/MAP Rs 1000/1300/1500. CNB CP/MAP Rs 500/800.', 15, 'Available', 2800, 800)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel GM Castle (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_gm_castle', 'Hotel GM Castle', 3, 'srinagar', 'Srinagar', 'hotel',
   'Rajbagh, Srinagar, J&K', '+919541397286', '+919541397286', 'reservations.gmcastle@gmail.com', '',
   'Hotel in Rajbagh, Srinagar. B2B rates 01 Jul-30 Sep 2026, exclude GST. Breakfast Rs 450/pax, lunch/dinner Rs 650/pax. Child <5 complimentary. Manager: Ms Nuzhat Geelani.', '{}', true, '2026-07-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_gm_castle_1', 'hotel_gm_castle', 'Deluxe Room', 'Deluxe', 'MAP', 1700, 1900, 2200, 3500, 600, 800, 'extra', 'Rates exclude GST. Extra bed EP/CP/MAP/AP Rs 400/600/800/1500. CWOB Rs 200/400/600/1200.', 5, 'Available', 1900, 600)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Green Heights Pahalgam (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_green_heights_pahalgam', 'Hotel Green Heights Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Pahalgam, J&K', '+919797978007', '+919797978007', 'info@hotelgreenheights.com', 'www.hotelgreenheights.com',
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
  ('rm_hotel_green_heights_paha_1', 'hotel_green_heights_pahalgam', 'Super Deluxe Room', 'Super Deluxe', 'MAP', 0, 0, 3000, 0, 650, 1000, 'as_applicable', 'MAP rate. Extra bed Rs 1000, CNB Rs 650.', 5, 'Available', 3000, 650)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel The Kaisar (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_the_kaisar', 'Hotel The Kaisar', 3, 'srinagar', 'Srinagar', 'hotel',
   '243/244 Jawahar Nagar, Srinagar 190008, J&K', '+919419009079', '+919419009079', 'info@hotelkaisar.com', 'www.hotelkaisar.com',
   'Hotel in Jawahar Nagar, Srinagar. GST 01BKLPK1946D1ZJ. Advance = 1 night to guarantee. Reservation Manager: Pakeeza.', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_the_kaisar_1', 'hotel_the_kaisar', 'Deluxe Room', 'Deluxe', 'MAP', 2200, 2500, 3000, 0, 0, 0, 'as_applicable', 'MAP/CP/EP as listed.', 5, 'Available', 2500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Casa Galwan Boutique Hotel (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_casa_galwan', 'Casa Galwan Boutique Hotel', 4, 'leh', 'Leh', 'hotel',
   'Shanti Stupa Road, Yurtung, Leh, UT Ladakh 194101', '+919906971029', '+919906971029', 'info@casagalwan.com', 'www.casagalwan.com',
   '25-room all-season boutique hotel in Leh with balcony-view rooms and Airbnb-style rooms with kitchen. Tariff 2026-27, incl taxes, non-commissionable. Extra bed @ 40% of tariff. Buffet lunch Rs 700/pax. Check-in 12:00 / out 10:00. Rates shown are double occupancy.', '{"Mountain View","Free WiFi","Room Service","24h Reception"}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_casa_galwan_1', 'hotel_casa_galwan', 'Casa Classic', 'Deluxe', 'MAP', 6000, 7200, 7900, 0, 0, 0, 'non_commissionable', 'Double occ. Single EP/CP/MAP Rs 5200/6500/7200. Extra bed 40% of tariff. Incl taxes.', 6, 'Available', 7200, 0),
  ('rm_hotel_casa_galwan_2', 'hotel_casa_galwan', 'Casa Premium with Balcony', 'Super Deluxe', 'MAP', 6900, 8300, 9200, 0, 0, 0, 'non_commissionable', 'Balcony. Double occ. Single Rs 6500/7800/8600.', 6, 'Available', 8300, 0),
  ('rm_hotel_casa_galwan_3', 'hotel_casa_galwan', 'Casa Suite with Balcony', 'Suite', 'MAP', 8400, 9900, 10900, 0, 0, 0, 'non_commissionable', 'Balcony. Single/Double same rate.', 4, 'Available', 9900, 0),
  ('rm_hotel_casa_galwan_4', 'hotel_casa_galwan', 'Casa BnB (Kitchen Access)', 'Villa', 'MAP', 7200, 8600, 9400, 0, 0, 0, 'non_commissionable', 'Airbnb-style with kitchen access. Double occ. Single Rs 6800/8100/8800.', 4, 'Available', 8600, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Arison Luxury (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_arison_luxury', 'Arison Luxury', 4, 'srinagar', 'Srinagar', 'hotel',
   'Hyderpora, Srinagar, J&K', '', '', 'info@arisonluxury.com', 'www.arisonluxury.com',
   'Luxury hotel at Hyderpora, Srinagar. Revised travel-partner rates valid until 31 Oct 2026. Extra bed EP/CP/MAP/AP Rs 1200/1800/2500/3000. CWOB CP/MAP/AP Rs 1200/1500/2000.', '{}', true, null, '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_arison_luxury_1', 'hotel_arison_luxury', 'Deluxe Room', 'Deluxe', 'MAP', 4500, 5500, 6500, 8000, 1500, 2500, 'as_applicable', 'Valid to 31 Oct 2026.', 5, 'Available', 5500, 1500),
  ('rm_hotel_arison_luxury_2', 'hotel_arison_luxury', 'Premium Room', 'Super Deluxe', 'MAP', 5500, 6500, 8000, 9500, 1500, 2500, 'as_applicable', '', 5, 'Available', 6500, 1500),
  ('rm_hotel_arison_luxury_3', 'hotel_arison_luxury', 'Luxury Premium', 'Super Deluxe', 'MAP', 6500, 7500, 8500, 10000, 1500, 2500, 'as_applicable', '', 5, 'Available', 7500, 1500),
  ('rm_hotel_arison_luxury_4', 'hotel_arison_luxury', 'Suite Room', 'Suite', 'MAP', 8500, 10000, 12500, 15000, 1500, 2500, 'as_applicable', '', 3, 'Available', 10000, 1500)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Lotus, Leh (Leh)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_lotus_leh', 'Hotel Lotus, Leh', 3, 'leh', 'Leh', 'hotel',
   'Leh, Ladakh', '+919560511001', '+919560511001', 'sales.fiohotels@gmail.com', 'www.fiohotels.com',
   'Hotel Lotus, Leh (Fio Hotels & Resorts), 19 rooms. Rates 01 Apr-31 Oct 2026. Extra bed 40% of rate; child without bed 25%. GST extra if bill required.', '{}', true, '2026-04-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_lotus_leh_1', 'hotel_lotus_leh', 'Deluxe Room', 'Deluxe', 'MAP', 3000, 3400, 3800, 4800, 0, 0, 'extra', 'Extra bed 40% of rate; child without bed 25%. GST extra if bill required.', 5, 'Available', 3400, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Lotus Eco Resort, Nubra Valley (Nubra Valley)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_lotus_eco_resort_nubra', 'Lotus Eco Resort, Nubra Valley', 3, 'leh', 'Nubra Valley', 'hotel',
   'Hunder, Nubra Valley, Ladakh', '+919560511001', '+919560511001', 'sales.fiohotels@gmail.com', 'www.fiohotels.com',
   'Lotus Eco Resort, Nubra Valley (Fio Hotels). Rates 01 Apr-31 Oct 2026. Extra bed 40% of rate; child without bed 25%. GST extra if bill required.', '{}', true, '2026-04-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_lotus_eco_resort_n_1', 'hotel_lotus_eco_resort_nubra', 'Cottage Suite', 'Cottage', 'MAP', 3200, 3700, 4200, 5200, 0, 0, 'extra', '12 cottage suites. Extra bed 40%; CNB 25%.', 5, 'Available', 3700, 0),
  ('rm_hotel_lotus_eco_resort_n_2', 'hotel_lotus_eco_resort_nubra', 'Swiss Deluxe Camp', 'Camp / Tent', 'MAP', 1700, 2200, 2700, 3200, 0, 0, 'extra', '4 Swiss deluxe camps. Extra bed 40%; CNB 25%.', 4, 'Available', 2200, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Oasis Retreat Cottage, Pangong (Pangong)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_oasis_retreat_pangong', 'Oasis Retreat Cottage, Pangong', 3, 'leh', 'Pangong', 'hotel',
   'Pangong, Ladakh', '+919560511001', '+919560511001', 'sales.fiohotels@gmail.com', 'www.fiohotels.com',
   'Oasis Retreat Cottage, Pangong (Fio Hotels). Rates 01 Apr-31 Oct 2026. Extra bed 40%; child without bed 25%. GST extra if bill required.', '{}', true, '2026-04-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_oasis_retreat_pang_1', 'hotel_oasis_retreat_pangong', 'Wooden Cottage', 'Cottage', 'MAP', 2700, 3000, 3500, 0, 0, 0, 'extra', 'Extra bed 40%; CNB 25%.', 5, 'Available', 3000, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Metropolis (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_metropolis_srinagar', 'Hotel Metropolis', 3, 'srinagar', 'Srinagar', 'hotel',
   'Kralsangri Brein, Nishat, Srinagar, J&K', '+919906510627', '+919906510627', 'hotelmetropoliskashmir@gmail.com', 'hotelmetropolis.in',
   'Hotel at Kralsangri Brein, Nishat, Srinagar. Low-season (LTA) rates valid 01 Jul-15 Sep 2026. GSTIN 01AAECM1024H1Z8. Alt contact 9796556646.', '{}', true, '2026-07-01', '2026-09-15')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_metropolis_srinaga_1', 'hotel_metropolis_srinagar', 'Deluxe Double', 'Deluxe', 'MAP', 3000, 3500, 4000, 0, 0, 1300, 'as_applicable', 'Low-season (LTA). Extra bed EP/CP/MAP Rs 800/1000/1300.', 5, 'Available', 3500, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Sapphire, Srinagar (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_the_sapphire_srinagar', 'The Sapphire, Srinagar', 3, 'srinagar', 'Srinagar', 'hotel',
   'Srinagar, J&K', '', '', 'thesapphiresalessxr@gmail.com', '',
   'Rates Jul-Sep 2026, exclude GST (12% GST on room rent for online/bank payments). Reservation Manager: Iqra Wani.', '{}', true, '2026-07-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_the_sapphire_srina_1', 'hotel_the_sapphire_srinagar', 'Deluxe Room', 'Deluxe', 'MAP', 2500, 3000, 3500, 0, 1000, 1500, 'extra', 'Exclude GST; 12% GST on room rent for online/bank payments. EB Rs 1500, CNB Rs 1000.', 5, 'Available', 3000, 1000)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Barzam Lake View Resort (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_barzam_lake_view_resort', 'Barzam Lake View Resort', 3, 'srinagar', 'Srinagar', 'hotel',
   'Foreshore, Shalimar Garden Road, Shalimar, Srinagar 190025', '+919797885086', '+919797885086', 'staykashmir@gmail.com', '',
   'Lake-view resort at Shalimar (Stay Kashmir / Su Palacio Resorts LLP). Contact 9797885086 / 9541908101.', '{"Lake View"}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_barzam_lake_view_r_1', 'hotel_barzam_lake_view_resort', 'Deluxe Room', 'Deluxe', 'MAP', 0, 0, 2000, 0, 600, 900, 'as_applicable', 'MAP rate. Extra bed Rs 900, CWB Rs 600.', 5, 'Available', 2000, 600)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Petals of Chinar (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_petals_of_chinar', 'Petals of Chinar', 3, 'srinagar', 'Srinagar', 'hotel',
   'Srinagar, J&K', '+919797885086', '+919797885086', 'staykashmir@gmail.com', '',
   'Stay Kashmir property (Su Palacio Resorts LLP). Contact 9797885086 / 9541908101.', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_petals_of_chinar_1', 'hotel_petals_of_chinar', 'Deluxe Room', 'Deluxe', 'MAP', 0, 0, 1800, 0, 500, 700, 'as_applicable', 'MAP rate. Extra bed Rs 700, CWB Rs 500.', 5, 'Available', 1800, 500)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Rain Forest Retreat Pahalgam (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_rain_forest_retreat_pahalgam', 'Rain Forest Retreat Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Pahalgam, J&K', '+919797885086', '+919797885086', 'staykashmir@gmail.com', '',
   'Stay Kashmir property in Pahalgam (Su Palacio Resorts LLP). Contact 9797885086 / 9541908101.', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_rain_forest_retrea_1', 'hotel_rain_forest_retreat_pahalgam', 'Deluxe Room', 'Deluxe', 'MAP', 0, 0, 2500, 0, 600, 800, 'as_applicable', 'MAP rate. Extra bed Rs 800, CWB Rs 600.', 5, 'Available', 2500, 600)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Tribe Villa (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_tribe_villa', 'Tribe Villa', 3, 'srinagar', 'Srinagar', 'hotel',
   'Srinagar, J&K', '+919797885086', '+919797885086', 'staykashmir@gmail.com', '',
   'Villa (5 rooms), Stay Kashmir / Su Palacio Resorts LLP. Whole villa MAP Rs 20000. Contact 9797885086 / 9541908101.', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_tribe_villa_1', 'hotel_tribe_villa', 'Villa Room', 'Villa', 'MAP', 0, 0, 5000, 0, 0, 0, 'as_applicable', 'Per room MAP Rs 5000; whole villa (5 rooms) Rs 20000.', 5, 'Available', 5000, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Little Silver Pahalgam (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_little_silver_pahalgam', 'Little Silver Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Pahalgam, J&K', '', '', 'hotellittlesilverpahalgam@gmail.com', '',
   'Hotel in Pahalgam. Rates valid 01 Apr-31 Oct 2026, include GST. Extra dinner supplement Rs 900+18% GST.', '{}', true, '2026-04-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_little_silver_paha_1', 'hotel_little_silver_pahalgam', 'Deluxe Room', 'Deluxe', 'MAP', 1800, 2300, 3200, 0, 1000, 1500, 'included', 'Incl GST. EB EP/CP/MAP Rs 700/1000/1500. CNB CP/MAP Rs 500/1000.', 5, 'Available', 2300, 1000),
  ('rm_hotel_little_silver_paha_2', 'hotel_little_silver_pahalgam', 'Grand Room (with Balcony)', 'Super Deluxe', 'MAP', 2100, 2600, 3500, 0, 1000, 1500, 'included', 'With balcony. Incl GST.', 5, 'Available', 2600, 1000)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Grand Retreat (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_grand_retreat_srinagar', 'Hotel Grand Retreat', 3, 'srinagar', 'Srinagar', 'hotel',
   'Rajbagh, Srinagar, J&K', '+919622620724', '+919622620724', 'info@grandretreat.in', 'www.grandretreat.in',
   'Hotel in Rajbagh, Srinagar. B2B rates from July 2026, exclude GST. Reservation Manager: Arsh Bhat (alt 8899902594).', '{}', true, '2026-07-01', null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_grand_retreat_srin_1', 'hotel_grand_retreat_srinagar', 'Deluxe Room', 'Deluxe', 'MAP', 0, 0, 2500, 0, 700, 900, 'extra', 'MAP rate. Exclude GST. Extra bed Rs 900, CNB Rs 700.', 5, 'Available', 2500, 700)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Sparrow (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_sparrow_srinagar', 'Hotel Sparrow', 3, 'srinagar', 'Srinagar', 'hotel',
   'Srinagar, J&K', '', '', 'reservations@hotelsparrow.com', 'www.hotelsparrow.com',
   'Rates as provided (single MAP rate).', '{}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_sparrow_srinagar_1', 'hotel_sparrow_srinagar', 'Deluxe Room', 'Deluxe', 'MAP', 0, 0, 5000, 0, 0, 1500, 'as_applicable', 'MAP rate. Extra bed Rs 1500.', 5, 'Available', 5000, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel K28 INN (Srinagar)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_k28_inn', 'Hotel K28 INN', 3, 'srinagar', 'Srinagar', 'hotel',
   'Srinagar, J&K', '', '', 'reservations@k28inn.com', 'www.k28inn.com',
   'Seasonal rates from 01 Jul 2026 onwards. Child <5 (no bed) free. Extra bed EP/CP/MAP/AP Rs 500/700/1000/1200. CWOB CP/MAP/AP Rs 300/500/800.', '{}', true, '2026-07-01', null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_k28_inn_1', 'hotel_k28_inn', 'Deluxe Room', 'Deluxe', 'MAP', 1800, 2200, 2800, 3400, 500, 1000, 'as_applicable', 'Extra bed EP/CP/MAP/AP Rs 500/700/1000/1200.', 12, 'Available', 2200, 500),
  ('rm_hotel_k28_inn_2', 'hotel_k28_inn', 'Super Deluxe', 'Super Deluxe', 'MAP', 2300, 2700, 3300, 3900, 500, 1000, 'as_applicable', '', 4, 'Available', 2700, 500),
  ('rm_hotel_k28_inn_3', 'hotel_k28_inn', 'Family Room', 'Suite', 'MAP', 3000, 3800, 5000, 6200, 500, 1000, 'as_applicable', '', 2, 'Available', 3800, 500),
  ('rm_hotel_k28_inn_4', 'hotel_k28_inn', 'Premium', 'Super Deluxe', 'MAP', 3000, 3400, 4000, 4600, 500, 1000, 'as_applicable', '', 6, 'Available', 3400, 500)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Riviera Hotel Pahalgam (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_riviera_pahalgam', 'The Riviera Hotel Pahalgam', 4, 'pahalgam', 'Pahalgam', 'hotel',
   'Pahalgam, J&K', '+917889501583', '+917889501583', 'reservation@rivierahotel.co.in', 'www.rivierapahalgam.com',
   '4-star premium property in Pahalgam (Riviera Group of Hotels). CP col = CPAI, MAP col = MAPAI. Season 01 Jul-15 Sep 2026 in columns; 15 Sep-15 Nov 2026 in notes. CPAI plan gets complimentary dinner. Free WiFi & parking. GM: Adil Wani.', '{"Free WiFi","Parking","Restaurant"}', true, '2026-07-01', '2026-11-15')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_riviera_pahalgam_1', 'hotel_riviera_pahalgam', 'Premium Deluxe Room', 'Super Deluxe', 'MAP', 0, 4000, 4500, 0, 800, 2000, 'as_applicable', 'CPAI/MAPAI. Season 01 Jul-15 Sep. 15 Sep-15 Nov: CP/MAP Rs 5000/5500. EB CP/MAP Rs 1500/2000.', 5, 'Available', 4000, 800),
  ('rm_hotel_riviera_pahalgam_2', 'hotel_riviera_pahalgam', 'Luxury Suite Room', 'Suite', 'MAP', 0, 6000, 7500, 0, 800, 2000, 'as_applicable', '15 Sep-15 Nov: CP/MAP Rs 6500/8000.', 3, 'Available', 6000, 800),
  ('rm_hotel_riviera_pahalgam_3', 'hotel_riviera_pahalgam', 'Family Suite Room (4 Pax)', 'Suite', 'MAP', 0, 8000, 10000, 0, 800, 2000, 'as_applicable', '4 pax. 15 Sep-15 Nov: CP/MAP Rs 10000/12000.', 2, 'Available', 8000, 800)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel The Regency Pahalgam (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_the_regency_pahalgam', 'Hotel The Regency Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Movera, Water Rafting Point, Pahalgam 192126', '+919622071111', '+919622071111', 'info@theregency.in', 'www.hoteltheregency.in',
   'Hotel at Movera, Pahalgam. FIT/GIT rates 01 Jul-30 Sep 2026, exclude GST. Child <5 complimentary. Manager: Syed Yasir Bukhari.', '{}', true, '2026-07-01', '2026-09-30')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_the_regency_pahalg_1', 'hotel_the_regency_pahalgam', 'Deluxe Room', 'Deluxe', 'MAP', 3000, 3500, 4000, 6000, 1000, 1500, 'extra', 'Exclude GST. EB EP/CP/MAP/AP Rs 800/1000/1500/2000. CWOB Rs 500/700/1000/1500.', 5, 'Available', 3500, 1000),
  ('rm_hotel_the_regency_pahalg_2', 'hotel_the_regency_pahalgam', 'Super Deluxe Room', 'Super Deluxe', 'MAP', 3500, 4500, 5500, 7000, 1000, 1500, 'extra', '', 5, 'Available', 4500, 1000),
  ('rm_hotel_the_regency_pahalg_3', 'hotel_the_regency_pahalgam', 'Lidder View Luxury Suite', 'Suite', 'MAP', 6000, 7000, 8000, 9000, 1000, 1500, 'extra', 'Lidder river view.', 3, 'Available', 7000, 1000),
  ('rm_hotel_the_regency_pahalg_4', 'hotel_the_regency_pahalgam', 'Family Room (Interconnected)', 'Suite', 'MAP', 7000, 8000, 10000, 12000, 1000, 1500, 'extra', 'Interconnected.', 2, 'Available', 8000, 1000)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- The Gulmarg Gateway Resort (Gulmarg)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_gulmarg_gateway_resort', 'The Gulmarg Gateway Resort', 3, 'gulmarg', 'Gulmarg', 'hotel',
   'Near Petrol Pump, Iqbal Colony, Tangmarg-Gulmarg Road, J&K 193402', '+917006704760', '+917006704760', 'thegulmarggatewayresort@gmail.com', '',
   'Resort near Tangmarg on the Gulmarg road. Tariff May-Oct 2026, net and non-commissionable. Breakfast Rs 299/pax, lunch/dinner Rs 499/pax. Child 0-6 free. Alt contacts 9797248321, 7780974704.', '{}', true, '2026-05-01', '2026-10-31')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_gulmarg_gateway_re_1', 'hotel_gulmarg_gateway_resort', 'Standard Room', 'Standard', 'MAP', 1800, 2200, 2200, 0, 800, 600, 'non_commissionable', 'Net non-comm. Extra mattress EP/CP/MAP Rs 300/400/600. Child 6-12 WOB Rs 200/400/800.', 5, 'Available', 2200, 800),
  ('rm_hotel_gulmarg_gateway_re_2', 'hotel_gulmarg_gateway_resort', 'Deluxe', 'Deluxe', 'MAP', 2000, 2300, 2600, 0, 800, 600, 'non_commissionable', 'Extra mattress EP/CP/MAP Rs 300/400/600.', 5, 'Available', 2300, 800),
  ('rm_hotel_gulmarg_gateway_re_3', 'hotel_gulmarg_gateway_resort', 'Super Deluxe', 'Super Deluxe', 'MAP', 2700, 3200, 3500, 0, 800, 800, 'non_commissionable', 'Extra mattress EP/CP/MAP Rs 300/500/800.', 5, 'Available', 3200, 800)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- Hotel Grand One Pahalgam (Pahalgam)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_grand_one_pahalgam', 'Hotel Grand One Pahalgam', 3, 'pahalgam', 'Pahalgam', 'hotel',
   'Near Main Bazaar, Pahalgam, J&K', '+919906908757', '+919906908757', 'hotelgrandonepahalgam@gmail.com', '',
   '3-star hotel near Pahalgam main bazaar (6 deluxe rooms, RJ Hotels & Resorts). Season rates (15 Mar-20 Jul & 15 Dec-10 Jan) in columns; off-season (21 Jul-14 Dec) in notes. Check-in/out 12:00. Contact: Rajesh.', '{"Central Heating","Free WiFi","Parking","Mountain View","Hot Water","Room Service","Restaurant","24h Reception"}', true, null, null)
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_grand_one_pahalgam_1', 'hotel_grand_one_pahalgam', 'Mountain View', 'Deluxe', 'MAP', 2000, 2400, 3000, 3500, 0, 900, 'as_applicable', 'Season (EPAI/CPAI/MAPI/APAI). Off-season (21 Jul-14 Dec): EP/CP/MAP/AP Rs 1600/2000/2400/3000. EB season Rs 500/700/900/1100.', 3, 'Available', 2400, 0),
  ('rm_hotel_grand_one_pahalgam_2', 'hotel_grand_one_pahalgam', 'Garden View', 'Deluxe', 'MAP', 1800, 2200, 2800, 3300, 0, 900, 'as_applicable', 'Season. Off-season: EP/CP/MAP/AP Rs 1400/1800/2200/2800.', 3, 'Available', 2200, 0)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

-- ------------------------------------------------------------
-- ApriQuince Lodge, Tangmarg (Tangmarg)
-- ------------------------------------------------------------
insert into public.hotels
  (id, name, stars, location, location_label, property_type, address, phone, whatsapp_phone, email, website, description, amenities, approved, tariff_start, tariff_end)
values
  ('hotel_apriquince_lodge', 'ApriQuince Lodge, Tangmarg', 3, 'gulmarg', 'Tangmarg', 'hotel',
   'Tangmarg, J&K', '+917006583664', '+917006583664', 'info@apriquincelodge.com', 'www.apriquincelodge.com',
   'Lodge in Tangmarg (Gulmarg gateway). Summer rates 15 May-15 Aug 2026 in columns; winter (16 Aug-14 May) in notes. Incl taxes, non-commissionable. GST 01ASPPN8936M1Z2. Child <5 free.', '{}', true, '2026-05-15', '2026-08-15')
on conflict (id) do update set
  name=excluded.name, stars=excluded.stars, location=excluded.location, location_label=excluded.location_label,
  property_type=excluded.property_type, address=excluded.address, phone=excluded.phone,
  whatsapp_phone=excluded.whatsapp_phone, email=excluded.email, website=excluded.website,
  description=excluded.description, amenities=excluded.amenities, approved=excluded.approved,
  tariff_start=excluded.tariff_start, tariff_end=excluded.tariff_end, updated_at=now();

insert into public.rooms
  (id, hotel_id, type, category, meal, ep, cp, map_rate, ap, child_wob, extra_bed, gst, notes, inventory, status, double, cnb)
values
  ('rm_hotel_apriquince_lodge_1', 'hotel_apriquince_lodge', 'Standard Room', 'Standard', 'MAP', 1200, 1500, 2500, 0, 350, 500, 'included', 'Summer. Winter (16 Aug+): EP/CP/MAP Rs 2000/2500/3000. Incl taxes. EB EP/CP/MAP Rs 200/300/500.', 5, 'Available', 1500, 350),
  ('rm_hotel_apriquince_lodge_2', 'hotel_apriquince_lodge', 'Deluxe Room', 'Deluxe', 'MAP', 1300, 1750, 2800, 0, 350, 500, 'included', 'Summer. Winter: EP/CP/MAP Rs 2300/2750/3300.', 5, 'Available', 1750, 350),
  ('rm_hotel_apriquince_lodge_3', 'hotel_apriquince_lodge', 'Family Room (4 Sharing)', 'Suite', 'MAP', 2000, 2750, 3800, 0, 350, 500, 'included', '4 sharing. Summer. Winter: EP/CP/MAP Rs 3000/3500/4200.', 3, 'Available', 2750, 350)
on conflict (id) do update set
  type=excluded.type, category=excluded.category, meal=excluded.meal, ep=excluded.ep, cp=excluded.cp,
  map_rate=excluded.map_rate, ap=excluded.ap, child_wob=excluded.child_wob, extra_bed=excluded.extra_bed,
  gst=excluded.gst, notes=excluded.notes, inventory=excluded.inventory, status=excluded.status,
  double=excluded.double, cnb=excluded.cnb, updated_at=now();

commit;
