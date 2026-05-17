export type RoomStatus = 'Available' | 'Limited' | 'Sold Out'
export type MealPlan = 'CP' | 'MAP' | 'AP' | 'EP'
export type StarCategory = 1 | 2 | 3 | 4 | 5
export type Location = 'houseboats' | 'srinagar' | 'gulmarg' | 'pahalgam' | 'sonamarg' | 'gurez'
export type RoomCategory =
  | 'Standard' | 'Deluxe' | 'Super Deluxe' | 'Suite' | 'Executive Suite' | 'Presidential Suite'
  | 'Houseboat Standard' | 'Houseboat Deluxe' | 'Houseboat Royal'
  | 'Cottage' | 'Villa' | 'Camp / Tent'
export type ConcernStatus = 'open' | 'in-progress' | 'resolved' | 'closed'
export type ConcernCategory =
  | 'Rate Discrepancy' | 'Room Quality' | 'Service Issue'
  | 'Availability Error' | 'Billing Problem' | 'Other'

export interface Room {
  id: string
  hotelId: string
  type: string
  category: RoomCategory
  meal: MealPlan
  double: number
  cnb: number
  extraBed: number
  inventory: number
  status: RoomStatus
  updatedAt: number
}

export interface Hotel {
  id: string
  name: string
  stars: StarCategory
  location: Location
  locationLabel: string
  address: string
  phone: string
  email: string
  website: string
  description: string
  amenities: string[]
  approved: boolean
  createdAt: number
  updatedAt: number
  rooms: Room[]
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

export type HotelsMap = Record<string, Hotel>

export const LOCATIONS: { value: Location | 'all'; label: string }[] = [
  { value: 'all', label: 'All Locations' },
  { value: 'houseboats', label: 'Houseboats' },
  { value: 'srinagar', label: 'Srinagar' },
  { value: 'gulmarg', label: 'Gulmarg' },
  { value: 'pahalgam', label: 'Pahalgam' },
  { value: 'sonamarg', label: 'Sonamarg' },
  { value: 'gurez', label: 'Gurez' },
]

export const LOCATION_LABELS: Record<Location, string> = {
  houseboats: 'Houseboats, Dal Lake',
  srinagar: 'Srinagar',
  gulmarg: 'Gulmarg',
  pahalgam: 'Pahalgam',
  sonamarg: 'Sonamarg',
  gurez: 'Gurez',
}

export const MEAL_LABELS: Record<MealPlan, string> = {
  CP: 'CP — Breakfast Only',
  MAP: 'MAP — Breakfast & Dinner',
  AP: 'AP — All Meals',
  EP: 'EP — No Meals',
}

export const ROOM_CATEGORIES: RoomCategory[] = [
  'Standard', 'Deluxe', 'Super Deluxe', 'Suite', 'Executive Suite',
  'Presidential Suite', 'Houseboat Standard', 'Houseboat Deluxe',
  'Houseboat Royal', 'Cottage', 'Villa', 'Camp / Tent',
]

export const CONCERN_CATEGORIES: ConcernCategory[] = [
  'Rate Discrepancy', 'Room Quality', 'Service Issue',
  'Availability Error', 'Billing Problem', 'Other',
]

export const STAR_LABELS: Record<number, string> = {
  1: '1 Star', 2: '2 Star', 3: '3 Star', 4: '4 Star', 5: '5 Star Deluxe',
}

export const AMENITIES_LIST = [
  'Free WiFi', 'Parking', 'Room Service', 'Laundry', 'Airport Transfer',
  'Shikara Ride', 'Breakfast Included', 'Hot Water', 'AC', 'Heating',
  'Restaurant', 'Conference Room', 'Doctor on Call', '24h Reception',
]

// =============================================================
// Row ↔ Hotel/Room/Concern mappers (DB snake_case ↔ camelCase)
// =============================================================
import type { Hotel as HotelT, Room as RoomT, Concern as ConcernT } from './data'

type HotelRow = {
  id: string; name: string; stars: number; location: string; location_label: string
  address: string; phone: string; email: string; website: string; description: string
  amenities: string[]; approved: boolean; created_at: string; updated_at: string
}
type RoomRow = {
  id: string; hotel_id: string; type: string; category: string; meal: string
  double: number; cnb: number; extra_bed: number; inventory: number
  status: string; updated_at: string
}
type ConcernRow = {
  id: string; hotel_id: string; hotel_name: string; agent_name: string
  agent_email: string; agent_company: string; category: string; subject: string
  description: string; status: string; priority: string; admin_response: string
  admin_response_at: string | null; created_at: string; updated_at: string
}

export function rowToHotel(row: HotelRow, rooms: RoomRow[] = []): HotelT {
  return {
    id: row.id, name: row.name, stars: row.stars as StarCategory,
    location: row.location as Location, locationLabel: row.location_label,
    address: row.address, phone: row.phone, email: row.email,
    website: row.website, description: row.description, amenities: row.amenities,
    approved: row.approved,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    rooms: rooms.filter(r => r.hotel_id === row.id).map(rowToRoom),
  }
}

export function rowToRoom(row: RoomRow): RoomT {
  return {
    id: row.id, hotelId: row.hotel_id, type: row.type,
    category: row.category as RoomCategory, meal: row.meal as MealPlan,
    double: row.double, cnb: row.cnb, extraBed: row.extra_bed,
    inventory: row.inventory, status: row.status as RoomStatus,
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

export function rowToConcern(row: ConcernRow): ConcernT {
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
// Display helpers (formerly in lib/storage.ts)
// =============================================================
export function fmtDate(ts: number): string {
  if (!ts) return '—'
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
  if (!ts) return '—'
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function fmtINR(n: number | null | undefined): string {
  if (!n) return '—'
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
