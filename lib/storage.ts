import { Hotel, HotelsMap, AppStore, Concern, SEED_HOTELS, SEED_CONCERNS, STORE_KEY, LS_SYNC_KEY } from './data'
export { LS_SYNC_KEY } from './data'

const STORE_VERSION = 6

function seedStore(): AppStore {
  return {
    hotels: JSON.parse(JSON.stringify(SEED_HOTELS)),
    concerns: JSON.parse(JSON.stringify(SEED_CONCERNS)),
    version: STORE_VERSION,
  }
}

export function loadStore(): AppStore {
  if (typeof window === 'undefined') return seedStore()
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppStore
      if (parsed?.hotels && parsed?.version) {
        // merge new seed hotels into existing store (so adding a seed doesn't wipe edits)
        for (const id in SEED_HOTELS) {
          if (!parsed.hotels[id]) parsed.hotels[id] = SEED_HOTELS[id]
        }
        if (!parsed.concerns) parsed.concerns = {}
        return parsed
      }
    }
  } catch {}
  return seedStore()
}

export function saveStore(store: AppStore): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store))
    localStorage.setItem(LS_SYNC_KEY, Date.now().toString())
  } catch {}
}

/** Convenience reads for the public board and vendor portal. */
export function loadHotels(): HotelsMap {
  return loadStore().hotels
}

export function saveHotels(hotels: HotelsMap): void {
  const s = loadStore()
  s.hotels = hotels
  saveStore(s)
}

export function loadConcerns(): Record<string, Concern> {
  return loadStore().concerns
}

export function saveConcerns(concerns: Record<string, Concern>): void {
  const s = loadStore()
  s.concerns = concerns
  saveStore(s)
}

export function upsertConcern(c: Concern): void {
  const s = loadStore()
  s.concerns[c.id] = c
  saveStore(s)
}

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

export function bestStatus(rooms: Hotel['rooms']): string {
  if (!rooms.length) return 'Sold Out'
  if (rooms.some(r => r.status === 'Available')) return 'Available'
  if (rooms.some(r => r.status === 'Limited')) return 'Limited'
  return 'Sold Out'
}

export function totalInventory(rooms: Hotel['rooms']): number {
  return rooms.reduce((a, r) => a + (r.inventory || 0), 0)
}

export function availableInventory(rooms: Hotel['rooms']): number {
  return rooms.filter(r => r.status === 'Available').reduce((a, r) => a + (r.inventory || 0), 0)
}
