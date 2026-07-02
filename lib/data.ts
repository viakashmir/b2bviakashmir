export type RoomStatus = 'Available' | 'Limited' | 'Sold Out'
export type MealPlan = 'CP' | 'MAP' | 'AP' | 'EP'
export type StarCategory = 1 | 2 | 3 | 4 | 5
export type Location = 'srinagar' | 'gulmarg' | 'pahalgam' | 'sonamarg' | 'gurez'
export type PropertyType = 'hotel' | 'houseboat'
export type RoomCategory =
  | 'Standard' | 'Deluxe' | 'Super Deluxe' | 'Suite' | 'Executive Suite' | 'Presidential Suite'
  | 'Houseboat Standard' | 'Houseboat Deluxe' | 'Houseboat Super Deluxe' | 'Houseboat Royal'
  | 'Cottage' | 'Villa' | 'Camp / Tent'
export type ConcernStatus = 'open' | 'in-progress' | 'resolved' | 'closed'
export type ConcernCategory =
  | 'Rate Discrepancy' | 'Room Quality' | 'Service Issue'
  | 'Availability Error' | 'Billing Problem' | 'Other'

export type GstStatus = 'included' | 'extra' | 'as_applicable' | 'non_commissionable'

export interface Room {
  id: string
  hotelId: string
  type: string
  category: RoomCategory
  /** Default headline meal plan (used for the big rate on the public card). */
  meal: MealPlan
  /** Per-meal-plan rates. 0 = not offered. */
  ep: number
  cp: number
  map: number
  ap: number
  /** Child Without Bed surcharge, ₹ per child per night. */
  childWob: number
  /** Extra Bed surcharge, ₹ per bed per night. */
  extraBed: number
  /** GST treatment. */
  gst: GstStatus
  /** Free-text notes (e.g. "Max 3 Pax", "Net B2B"). */
  notes: string
  inventory: number
  status: RoomStatus
  updatedAt: number

  /** Legacy field, kept so old data still renders. cp will mirror this if zero. */
  double: number
  /** Legacy alias for childWob, kept on the type for back-compat reads. */
  cnb: number
}

export interface Hotel {
  id: string
  name: string
  stars: StarCategory
  location: Location
  locationLabel: string
  propertyType: PropertyType
  address: string
  phone: string
  /** WhatsApp number, falls back to `phone` when the vendor uses one number for both. */
  whatsapp: string
  email: string
  website: string
  description: string
  amenities: string[]
  approved: boolean
  /** ISO date 'YYYY-MM-DD' or '', tariff validity window. */
  tariffStart: string
  tariffEnd: string
  createdAt: number
  updatedAt: number
  rooms: Room[]
}

export const GST_LABELS: Record<GstStatus, string> = {
  included: 'GST Included',
  extra: 'GST Extra',
  as_applicable: 'GST As Applicable',
  non_commissionable: 'Net Non-Commissionable',
}

export interface Concern {
  id: string
  hotelId: string
  hotelName: string
  agentName: string
  agentEmail: string
  agentCompany: string
  category: ConcernCategory
  subject: string
  description: string
  status: ConcernStatus
  priority: 'low' | 'medium' | 'high'
  createdAt: number
  updatedAt: number
  adminResponse: string
  adminResponseAt: number
}

export interface Enquiry {
  id: string
  hotelId: string
  hotelName: string
  travellerName: string
  travellerPhone: string
  checkIn: string   // YYYY-MM-DD or ''
  checkOut: string  // YYYY-MM-DD or ''
  nights: number
  rooms: number
  adults: number
  children: number
  notes: string
  whatsappLink: string
  createdAt: number
}

export type HotelsMap = Record<string, Hotel>

// City filters on the public board and onboarding (no 'houseboats' here -
// houseboats are a property type within Srinagar, not their own city).
export const LOCATIONS: { value: Location | 'all'; label: string }[] = [
  { value: 'all', label: 'All Locations' },
  { value: 'srinagar', label: 'Srinagar' },
  { value: 'gulmarg', label: 'Gulmarg' },
  { value: 'pahalgam', label: 'Pahalgam' },
  { value: 'sonamarg', label: 'Sonamarg' },
  { value: 'gurez', label: 'Gurez' },
]

export const LOCATION_LABELS: Record<Location, string> = {
  srinagar: 'Srinagar',
  gulmarg: 'Gulmarg',
  pahalgam: 'Pahalgam',
  sonamarg: 'Sonamarg',
  gurez: 'Gurez',
}

// Coordinates for live weather strip (Open-Meteo).
export const LOCATION_COORDS: Record<Location, { lat: number; lon: number }> = {
  srinagar: { lat: 34.0837, lon: 74.7973 },
  gulmarg:  { lat: 34.0500, lon: 74.3833 },
  pahalgam: { lat: 34.0151, lon: 75.3260 },
  sonamarg: { lat: 34.3000, lon: 75.2900 },
  gurez:    { lat: 34.6500, lon: 74.8200 },
}

export const MEAL_LABELS: Record<MealPlan, string> = {
  CP: 'CP, Breakfast Only',
  MAP: 'MAP, Breakfast & Dinner',
  AP: 'AP, All Meals',
  EP: 'EP, No Meals',
}

// Room categories shown to vendors in the dashboard depend on property type.
export const HOTEL_ROOM_CATEGORIES: RoomCategory[] = [
  'Standard', 'Deluxe', 'Super Deluxe', 'Suite', 'Executive Suite',
  'Presidential Suite', 'Cottage', 'Villa', 'Camp / Tent',
]
export const HOUSEBOAT_ROOM_CATEGORIES: RoomCategory[] = [
  'Houseboat Standard', 'Houseboat Deluxe', 'Houseboat Super Deluxe', 'Houseboat Royal',
]
export const ROOM_CATEGORIES: RoomCategory[] = [
  ...HOTEL_ROOM_CATEGORIES,
  ...HOUSEBOAT_ROOM_CATEGORIES,
]

export function categoriesFor(type: PropertyType): RoomCategory[] {
  return type === 'houseboat' ? HOUSEBOAT_ROOM_CATEGORIES : HOTEL_ROOM_CATEGORIES
}

export const CONCERN_CATEGORIES: ConcernCategory[] = [
  'Rate Discrepancy', 'Room Quality', 'Service Issue',
  'Availability Error', 'Billing Problem', 'Other',
]

export const STAR_LABELS: Record<number, string> = {
  1: '1 Star', 2: '2 Star', 3: '3 Star', 4: '4 Star', 5: '5 Star Deluxe',
}

// Amenity lists differ by property type.
export const HOTEL_AMENITIES = [
  'Free WiFi', 'Parking', 'Room Service', 'Laundry', 'Airport Transfer',
  'Breakfast Included', 'Hot Water', 'AC', 'Heating', 'Restaurant',
  'Conference Room', 'Doctor on Call', '24h Reception',
]
export const HOUSEBOAT_AMENITIES = [
  'Free WiFi', 'Shikara Ride', 'Boat-boy Service', 'Cedar-wood Interiors',
  'Lake View', 'Hot Water', 'Heating', 'Breakfast Included',
  'Kashmiri Cuisine', 'Bonfire on Deck', 'Wazwan on Request', '24h Reception',
]
export const AMENITIES_LIST = HOTEL_AMENITIES // back-compat default
export function amenitiesFor(type: PropertyType): string[] {
  return type === 'houseboat' ? HOUSEBOAT_AMENITIES : HOTEL_AMENITIES
}

// =============================================================
// Row ↔ Hotel/Room/Concern mappers (DB snake_case ↔ camelCase)
// =============================================================
type HotelRow = {
  id: string; name: string; stars: number; location: string; location_label: string
  property_type: string | null
  address: string; phone: string; email: string; website: string; description: string
  amenities: string[]; approved: boolean; created_at: string; updated_at: string
  tariff_start: string | null; tariff_end: string | null
  whatsapp_phone: string | null
}
type RoomRow = {
  id: string; hotel_id: string; type: string; category: string; meal: string
  double: number; cnb: number; extra_bed: number
  ep: number | null; cp: number | null; map_rate: number | null; ap: number | null
  child_wob: number | null; gst: string | null; notes: string | null
  inventory: number; status: string; updated_at: string
}
type ConcernRow = {
  id: string; hotel_id: string; hotel_name: string; agent_name: string
  agent_email: string; agent_company: string; category: string; subject: string
  description: string; status: string; priority: string; admin_response: string
  admin_response_at: string | null; created_at: string; updated_at: string
}

export function rowToHotel(row: HotelRow, rooms: RoomRow[] = []): Hotel {
  return {
    id: row.id, name: row.name, stars: row.stars as StarCategory,
    location: row.location as Location, locationLabel: row.location_label,
    propertyType: (row.property_type as PropertyType | null) || 'hotel',
    address: row.address, phone: row.phone,
    whatsapp: (row.whatsapp_phone || row.phone || '').trim(),
    email: row.email,
    website: row.website, description: row.description, amenities: row.amenities,
    approved: row.approved,
    tariffStart: row.tariff_start ?? '',
    tariffEnd:   row.tariff_end   ?? '',
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    rooms: rooms.filter(r => r.hotel_id === row.id).map(rowToRoom),
  }
}

export function rowToRoom(row: RoomRow): Room {
  const cp = row.cp ?? 0
  const fallback = row.double ?? 0
  return {
    id: row.id, hotelId: row.hotel_id, type: row.type,
    category: row.category as RoomCategory, meal: row.meal as MealPlan,
    ep:       row.ep       ?? 0,
    cp:       cp || fallback, // fall back to legacy double when cp not set
    map:      row.map_rate ?? 0,
    ap:       row.ap       ?? 0,
    childWob: row.child_wob ?? row.cnb ?? 0,
    extraBed: row.extra_bed,
    gst:      (row.gst as GstStatus | null) ?? 'as_applicable',
    notes:    row.notes ?? '',
    inventory: row.inventory, status: row.status as RoomStatus,
    updatedAt: new Date(row.updated_at).getTime(),
    double: cp || fallback,
    cnb: row.child_wob ?? row.cnb ?? 0,
  }
}

type EnquiryRow = {
  id: string; hotel_id: string; hotel_name: string
  traveller_name: string; traveller_phone: string
  check_in: string | null; check_out: string | null
  nights: number; rooms: number; adults: number; children: number
  notes: string; whatsapp_link: string
  created_at: string
}

export function rowToEnquiry(row: EnquiryRow): Enquiry {
  return {
    id: row.id, hotelId: row.hotel_id, hotelName: row.hotel_name,
    travellerName: row.traveller_name, travellerPhone: row.traveller_phone,
    checkIn: row.check_in ?? '', checkOut: row.check_out ?? '',
    nights: row.nights, rooms: row.rooms, adults: row.adults, children: row.children,
    notes: row.notes, whatsappLink: row.whatsapp_link,
    createdAt: new Date(row.created_at).getTime(),
  }
}

export function rowToConcern(row: ConcernRow): Concern {
  return {
    id: row.id, hotelId: row.hotel_id, hotelName: row.hotel_name,
    agentName: row.agent_name, agentEmail: row.agent_email, agentCompany: row.agent_company,
    category: row.category as ConcernCategory, subject: row.subject,
    description: row.description, status: row.status as ConcernStatus,
    priority: row.priority as 'low' | 'medium' | 'high',
    adminResponse: row.admin_response,
    adminResponseAt: row.admin_response_at ? new Date(row.admin_response_at).getTime() : 0,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

// =============================================================
// Display helpers
// =============================================================
export function fmtDate(ts: number): string {
  if (!ts) return '-'
  const d = new Date(ts)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12; if (!h) h = 12
  const mm = m < 10 ? '0' + m : String(m)
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${h}:${mm} ${ampm}`
}

export function timeAgo(ts: number): string {
  if (!ts) return '-'
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function fmtINR(n: number | null | undefined): string {
  if (!n) return '-'
  return '₹' + Number(n).toLocaleString('en-IN')
}

export function bestStatus(rooms: Room[]): string {
  if (!rooms.length) return 'Sold Out'
  if (rooms.some(r => r.status === 'Available')) return 'Available'
  if (rooms.some(r => r.status === 'Limited')) return 'Limited'
  return 'Sold Out'
}

export function totalInventory(rooms: Room[]): number {
  return rooms.reduce((a, r) => a + (r.inventory || 0), 0)
}

export function availableInventory(rooms: Room[]): number {
  return rooms.filter(r => r.status === 'Available').reduce((a, r) => a + (r.inventory || 0), 0)
}

/** Lowest positive nightly rate (₹) across a hotel's rooms; 0 if none. */
export function hotelFromPrice(hotel: { rooms: Room[] }): number {
  let min = 0
  for (const r of hotel.rooms) {
    for (const v of [r.ep, r.cp, r.map, r.ap, r.double]) {
      if (v && v > 0 && (min === 0 || v < min)) min = v
    }
  }
  return min
}
