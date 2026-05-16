export type RoomStatus = 'Available' | 'Limited' | 'Sold Out'
export type MealPlan = 'CP' | 'MAP' | 'AP' | 'EP'
export type Location = 'dal-lake' | 'srinagar' | 'gulmarg' | 'pahalgam' | 'sonamarg' | 'gurez'
export type StarCategory = 1 | 2 | 3 | 4 | 5

export interface Room {
  id: string
  type: string
  meal: MealPlan
  single: number
  double: number
  triple: number | null
  inventory: number
  status: RoomStatus
}

export interface Hotel {
  id: string
  password: string
  name: string
  stars: StarCategory
  location: Location
  locationLabel: string
  phone: string
  email: string
  updatedAt: number
  rooms: Room[]
}

export type HotelsMap = Record<string, Hotel>

export const SEED_HOTELS: HotelsMap = {
  grandpalace: {
    id: 'grandpalace',
    password: 'gp2024',
    name: 'Grand Palace Hotel',
    stars: 5,
    location: 'dal-lake',
    locationLabel: 'Dal Lake, Srinagar',
    phone: '+91 194 245 6789',
    email: 'reservations@grandpalace.com',
    updatedAt: Date.now(),
    rooms: [
      { id: 'r1', type: 'Deluxe Room', meal: 'CP', single: 4500, double: 6500, triple: 8500, inventory: 12, status: 'Available' },
      { id: 'r2', type: 'Executive Suite', meal: 'MAP', single: 8000, double: 11000, triple: null, inventory: 5, status: 'Available' },
      { id: 'r3', type: 'Royal Suite', meal: 'AP', single: 14000, double: 18000, triple: null, inventory: 2, status: 'Limited' },
    ],
  },
  dalviewhouseboats: {
    id: 'dalviewhouseboats',
    password: 'dv2024',
    name: 'Dal View Houseboats',
    stars: 4,
    location: 'dal-lake',
    locationLabel: 'Dal Lake, Srinagar',
    phone: '+91 194 247 3456',
    email: 'book@dalviewhouseboats.com',
    updatedAt: Date.now(),
    rooms: [
      { id: 'r1', type: 'Standard Houseboat', meal: 'CP', single: 3500, double: 5200, triple: 6800, inventory: 8, status: 'Available' },
      { id: 'r2', type: 'Deluxe Houseboat', meal: 'MAP', single: 5800, double: 7800, triple: 9500, inventory: 4, status: 'Available' },
      { id: 'r3', type: 'Royal Houseboat', meal: 'AP', single: 9500, double: 13500, triple: null, inventory: 1, status: 'Limited' },
    ],
  },
  himalayancrest: {
    id: 'himalayancrest',
    password: 'hc2024',
    name: 'Himalayan Crest Resort',
    stars: 5,
    location: 'gulmarg',
    locationLabel: 'Gulmarg',
    phone: '+91 194 254 2222',
    email: 'stay@himalayancrest.com',
    updatedAt: Date.now(),
    rooms: [
      { id: 'r1', type: 'Mountain View Room', meal: 'MAP', single: 5500, double: 8200, triple: 10800, inventory: 10, status: 'Available' },
      { id: 'r2', type: 'Premium Chalet', meal: 'AP', single: 10500, double: 15000, triple: null, inventory: 3, status: 'Limited' },
      { id: 'r3', type: 'Alpine Suite', meal: 'AP', single: 17000, double: 24000, triple: null, inventory: 0, status: 'Sold Out' },
    ],
  },
  pinewood: {
    id: 'pinewood',
    password: 'pw2024',
    name: 'Pinewood Pahalgam',
    stars: 4,
    location: 'pahalgam',
    locationLabel: 'Pahalgam',
    phone: '+91 194 243 5678',
    email: 'info@pinewoodpahalgam.com',
    updatedAt: Date.now(),
    rooms: [
      { id: 'r1', type: 'Forest Room', meal: 'CP', single: 3200, double: 4800, triple: 6400, inventory: 15, status: 'Available' },
      { id: 'r2', type: 'Deluxe Forest Room', meal: 'MAP', single: 5000, double: 7200, triple: 9200, inventory: 6, status: 'Available' },
      { id: 'r3', type: 'Riverside Cottage', meal: 'AP', single: 8500, double: 12000, triple: null, inventory: 0, status: 'Sold Out' },
    ],
  },
  sonamargresort: {
    id: 'sonamargresort',
    password: 'sr2024',
    name: 'Sonamarg Alpine Resort',
    stars: 3,
    location: 'sonamarg',
    locationLabel: 'Sonamarg',
    phone: '+91 194 261 4444',
    email: 'stay@sonamargalpine.com',
    updatedAt: Date.now(),
    rooms: [
      { id: 'r1', type: 'Standard Room', meal: 'CP', single: 2800, double: 4200, triple: 5400, inventory: 20, status: 'Available' },
      { id: 'r2', type: 'Deluxe Room', meal: 'MAP', single: 4000, double: 5800, triple: 7200, inventory: 8, status: 'Available' },
    ],
  },
}

export const LOCATIONS: { value: Location | 'all'; label: string }[] = [
  { value: 'all', label: 'All Locations' },
  { value: 'srinagar', label: 'Srinagar' },
  { value: 'dal-lake', label: 'Dal Lake' },
  { value: 'gulmarg', label: 'Gulmarg' },
  { value: 'pahalgam', label: 'Pahalgam' },
  { value: 'sonamarg', label: 'Sonamarg' },
  { value: 'gurez', label: 'Gurez' },
]

export const MEAL_LABELS: Record<MealPlan, string> = {
  CP: 'CP — Breakfast',
  MAP: 'MAP — Breakfast & Dinner',
  AP: 'AP — All Meals',
  EP: 'EP — No Meals',
}

export const STORE_KEY = 'krp_hotels_v3'
export const LS_SYNC_KEY = 'krp_sync_v3'
