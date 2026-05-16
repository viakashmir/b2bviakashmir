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
  type: string
  category: RoomCategory
  meal: MealPlan
  single: number
  double: number
  triple: number | null
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

export interface AppStore {
  hotels: Record<string, Hotel>
  concerns: Record<string, Concern>
  version: number
}

export type HotelsMap = Record<string, Hotel>

export const STORE_KEY = 'krp_v6_store'
export const LS_SYNC_KEY = 'krp_v6_sync'

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

const NOW = Date.now()

export const SEED_HOTELS: HotelsMap = {
  grandpalace: {
    id: 'grandpalace', name: 'Grand Palace Hotel', stars: 5, location: 'srinagar',
    locationLabel: LOCATION_LABELS.srinagar, address: 'Residency Road, Srinagar 190001',
    phone: '+91 194 245 6789', email: 'reservations@grandpalace.com',
    website: 'www.grandpalacesrinagar.com',
    description: 'Landmark 5-star property in the heart of Srinagar with panoramic views of the Zabarwan mountains.',
    amenities: ['Free WiFi', 'Parking', 'Room Service', 'Restaurant', '24h Reception', 'Airport Transfer'],
    approved: true, createdAt: NOW, updatedAt: NOW,
    rooms: [
      { id: 'r1', type: 'Deluxe Room', category: 'Deluxe', meal: 'CP', single: 4500, double: 6500, triple: 8500, inventory: 12, status: 'Available', updatedAt: NOW },
      { id: 'r2', type: 'Executive Suite', category: 'Executive Suite', meal: 'MAP', single: 8000, double: 11000, triple: null, inventory: 5, status: 'Available', updatedAt: NOW },
      { id: 'r3', type: 'Presidential Suite', category: 'Presidential Suite', meal: 'AP', single: 14000, double: 18000, triple: null, inventory: 2, status: 'Limited', updatedAt: NOW },
    ],
  },
  dalview: {
    id: 'dalview', name: 'Dal View Houseboats', stars: 4, location: 'houseboats',
    locationLabel: LOCATION_LABELS.houseboats, address: 'Nagin Lake, Dal Lake, Srinagar',
    phone: '+91 194 247 3456', email: 'book@dalviewhouseboats.com',
    website: 'www.dalviewhouseboats.com',
    description: 'Heritage cedar-wood houseboats on the serene Dal Lake with authentic Kashmiri hospitality.',
    amenities: ['Free WiFi', 'Shikara Ride', 'Breakfast Included', 'Room Service', 'Hot Water'],
    approved: true, createdAt: NOW, updatedAt: NOW,
    rooms: [
      { id: 'r1', type: 'Standard Houseboat', category: 'Houseboat Standard', meal: 'CP', single: 3500, double: 5200, triple: 6800, inventory: 8, status: 'Available', updatedAt: NOW },
      { id: 'r2', type: 'Deluxe Houseboat', category: 'Houseboat Deluxe', meal: 'MAP', single: 5800, double: 7800, triple: 9500, inventory: 4, status: 'Available', updatedAt: NOW },
      { id: 'r3', type: 'Royal Houseboat', category: 'Houseboat Royal', meal: 'AP', single: 9500, double: 13500, triple: null, inventory: 1, status: 'Limited', updatedAt: NOW },
    ],
  },
  himalayancrest: {
    id: 'himalayancrest', name: 'Himalayan Crest Resort', stars: 5, location: 'gulmarg',
    locationLabel: LOCATION_LABELS.gulmarg, address: 'Main Road, Gulmarg 193403',
    phone: '+91 194 254 2222', email: 'stay@himalayancrest.com',
    website: 'www.himalayancrest.com',
    description: 'Ski-in/ski-out luxury at 2650m in Gulmarg — the skiing capital of India.',
    amenities: ['Free WiFi', 'Parking', 'Restaurant', 'Room Service', 'Heating', 'Conference Room'],
    approved: true, createdAt: NOW, updatedAt: NOW,
    rooms: [
      { id: 'r1', type: 'Mountain View Room', category: 'Deluxe', meal: 'MAP', single: 5500, double: 8200, triple: 10800, inventory: 10, status: 'Available', updatedAt: NOW },
      { id: 'r2', type: 'Premium Chalet', category: 'Suite', meal: 'AP', single: 10500, double: 15000, triple: null, inventory: 3, status: 'Limited', updatedAt: NOW },
      { id: 'r3', type: 'Alpine Suite', category: 'Executive Suite', meal: 'AP', single: 17000, double: 24000, triple: null, inventory: 0, status: 'Sold Out', updatedAt: NOW },
    ],
  },
  pinewood: {
    id: 'pinewood', name: 'Pinewood Pahalgam', stars: 4, location: 'pahalgam',
    locationLabel: LOCATION_LABELS.pahalgam, address: 'Lidder Valley, Pahalgam 192126',
    phone: '+91 194 243 5678', email: 'info@pinewoodpahalgam.com',
    website: 'www.pinewoodpahalgam.com',
    description: 'Pine-forest retreat beside the Lidder river — ideal base for Amarnath Yatra groups.',
    amenities: ['Free WiFi', 'Parking', 'Hot Water', 'Laundry', 'Doctor on Call', '24h Reception'],
    approved: true, createdAt: NOW, updatedAt: NOW,
    rooms: [
      { id: 'r1', type: 'Forest Room', category: 'Standard', meal: 'CP', single: 3200, double: 4800, triple: 6400, inventory: 15, status: 'Available', updatedAt: NOW },
      { id: 'r2', type: 'Deluxe Forest Room', category: 'Deluxe', meal: 'MAP', single: 5000, double: 7200, triple: 9200, inventory: 6, status: 'Available', updatedAt: NOW },
      { id: 'r3', type: 'Riverside Cottage', category: 'Cottage', meal: 'AP', single: 8500, double: 12000, triple: null, inventory: 0, status: 'Sold Out', updatedAt: NOW },
    ],
  },
  sonamargalpine: {
    id: 'sonamargalpine', name: 'Sonamarg Alpine Resort', stars: 3, location: 'sonamarg',
    locationLabel: LOCATION_LABELS.sonamarg, address: 'Main Bazaar, Sonamarg 193503',
    phone: '+91 194 261 4444', email: 'stay@sonamargalpine.com',
    website: '',
    description: 'Budget-friendly resort at the gateway to Thajiwas Glacier — ideal for trekkers.',
    amenities: ['Free WiFi', 'Hot Water', 'Heating', 'Parking'],
    approved: true, createdAt: NOW, updatedAt: NOW,
    rooms: [
      { id: 'r1', type: 'Standard Room', category: 'Standard', meal: 'CP', single: 2800, double: 4200, triple: 5400, inventory: 20, status: 'Available', updatedAt: NOW },
      { id: 'r2', type: 'Deluxe Room', category: 'Deluxe', meal: 'MAP', single: 4000, double: 5800, triple: 7200, inventory: 8, status: 'Available', updatedAt: NOW },
    ],
  },
}

export const SEED_CONCERNS: Record<string, Concern> = {
  con1: {
    id: 'con1', hotelId: 'himalayancrest', hotelName: 'Himalayan Crest Resort',
    agentName: 'Ahmed Khan', agentEmail: 'ahmed@gulfkashmir.com', agentCompany: 'Gulf Kashmir Tours',
    category: 'Availability Error',
    subject: 'Alpine Suite shown available but sold out on arrival',
    description: 'We booked 2 pax for Alpine Suite based on portal showing 2 rooms available. On arrival hotel said sold out for 3 days. Major inconvenience for clients.',
    status: 'open', priority: 'high',
    createdAt: NOW - 86400000, updatedAt: NOW - 86400000,
    adminResponse: '', adminResponseAt: 0,
  },
}
