import { Hotel, HotelsMap, SEED_HOTELS, STORE_KEY, LS_SYNC_KEY } from './data'
export { LS_SYNC_KEY } from './data'

export function loadHotels(): HotelsMap {
  if (typeof window === 'undefined') return JSON.parse(JSON.stringify(SEED_HOTELS))
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed: HotelsMap = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        // merge new seed hotels
        for (const id in SEED_HOTELS) {
          if (!parsed[id]) parsed[id] = SEED_HOTELS[id]
        }
        return parsed
      }
    }
  } catch {}
  return JSON.parse(JSON.stringify(SEED_HOTELS))
}

export function saveHotels(hotels: HotelsMap): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(hotels))
    localStorage.setItem(LS_SYNC_KEY, Date.now().toString())
  } catch {}
}

export function fmtDate(ts: number): string {
  if (!ts) return 'Not set'
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
  if (!ts) return 'Unknown'
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
