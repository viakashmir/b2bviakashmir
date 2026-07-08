'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mountain, Leaf, SlidersHorizontal,
  Search, Grid3x3, Building2, Sailboat, CalendarRange,
} from 'lucide-react'
import Header from '@/components/Header'
import HotelCard from '@/components/HotelCard'
import KashmirLive from '@/components/KashmirLive'
import {
  Hotel, LOCATIONS, Location, PropertyType, rowToHotel,
  hotelFromPrice, hotelIsSeasonal, HOTEL_AMENITIES, HOUSEBOAT_AMENITIES,
} from '@/lib/data'
import { browserSupabase } from '@/lib/supabase'

type PropFilter = 'all' | PropertyType
type SortKey = 'recommended' | 'price_asc' | 'price_desc' | 'newest'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price_asc',   label: 'Price ↑' },
  { key: 'price_desc',  label: 'Price ↓' },
  { key: 'newest',      label: 'Newest' },
]
const PROP_OPTS: { key: PropFilter; label: string; Icon: typeof Grid3x3 }[] = [
  { key: 'all',       label: 'All',        Icon: Grid3x3 },
  { key: 'hotel',     label: 'Hotels',     Icon: Building2 },
  { key: 'houseboat', label: 'Houseboats', Icon: Sailboat },
]
const AMENITY_OPTS = Array.from(new Set([...HOTEL_AMENITIES, ...HOUSEBOAT_AMENITIES]))

export default function PublicPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [filter, setFilter] = useState<Location | 'all'>('all')
  const [propFilter, setPropFilter] = useState<PropFilter>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('recommended')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [seasonalOnly, setSeasonalOnly] = useState(false)
  const [amenitySel, setAmenitySel] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Public page reads Supabase directly via anon key + RLS (which already
  // allows SELECT on approved hotels and their rooms). No API hop, this
  // makes real-time subscriptions and refresh-after-change instant.
  const refresh = useCallback(async () => {
    let sb: ReturnType<typeof browserSupabase> | null = null
    try { sb = browserSupabase() } catch (e) { setError((e as Error).message); return }
    try {
      const [{ data: hRows, error: hErr }, { data: rRows, error: rErr }] = await Promise.all([
        sb.from('hotels').select('*').eq('approved', true).order('created_at', { ascending: false }),
        sb.from('rooms').select('*'),
      ])
      if (hErr) throw hErr
      if (rErr) throw rErr
      setHotels((hRows ?? []).map((h: any) => rowToHotel(h, rRows ?? [])))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    refresh()
    let sb: ReturnType<typeof browserSupabase> | null = null
    try { sb = browserSupabase() } catch { return }
    const channel = sb.channel('public-hotels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hotels' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms'  }, refresh)
      .subscribe()
    return () => { sb!.removeChannel(channel) }
  }, [refresh])

  const filtered = hotels.filter(h => {
    const locMatch = filter === 'all' || h.location === filter
    const propMatch = propFilter === 'all' || h.propertyType === propFilter
    const s = search.toLowerCase().trim()
    const searchMatch = !s || h.name.toLowerCase().includes(s) || h.locationLabel.toLowerCase().includes(s)
    const p = hotelFromPrice(h)
    const minOk = !priceMin || (p > 0 && p >= Number(priceMin))
    const maxOk = !priceMax || (p > 0 && p <= Number(priceMax))
    const amenOk = amenitySel.length === 0 || amenitySel.every(a => h.amenities.includes(a))
    const seasonalOk = !seasonalOnly || hotelIsSeasonal(h)
    return locMatch && propMatch && searchMatch && minOk && maxOk && amenOk && seasonalOk
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price_asc')  return (hotelFromPrice(a) || Infinity) - (hotelFromPrice(b) || Infinity)
    if (sort === 'price_desc') return (hotelFromPrice(b) || 0) - (hotelFromPrice(a) || 0)
    if (sort === 'newest')     return b.createdAt - a.createdAt
    return 0 // recommended: keep server order (created_at desc)
  })

  const resetAll = () => {
    setFilter('all'); setPropFilter('all'); setSearch('')
    setPriceMin(''); setPriceMax(''); setSeasonalOnly(false); setAmenitySel([]); setSort('recommended')
  }
  const toggleAmenity = (a: string) =>
    setAmenitySel(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', opacity: 0.5 }}>Loading rates…</div>
      </div>
    )
  }

  return (
    <>
      <Header />

      <main className="app-shell">
        {/* Compact promo banner — keeps hotels above the fold */}
        <section className="promo-banner">
          <Mountain
            size={200}
            color="rgba(184,240,197,0.08)"
            style={{ position: 'absolute', right: -24, top: -40, pointerEvents: 'none' }}
          />
          <div className="promo-left">
            <span className="promo-overline">
              <Leaf size={13} strokeWidth={2.4} color="#b8f0c5" style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Kashmir B2B Rate Portal
            </span>
            <h1 className="promo-title">Live hotel &amp; houseboat rates, updated in real-time</h1>
            <p className="promo-sub">Srinagar · Gulmarg · Pahalgam · Sonamarg · Gurez — book confidently, no calls.</p>
          </div>
          <div className="hero-live-badge promo-badge">
            <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#b8f0c5', display: 'inline-block' }} />
            {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'} live
          </div>
        </section>

        <KashmirLive />

        {/* Sort bar */}
        <div className="sort-bar">
          <span className="sort-count">{sorted.length} {sorted.length === 1 ? 'hotel' : 'hotels'} found</span>
          <div className="sort-chips">
            <span className="t-overline" style={{ marginRight: 2 }}>Sort by</span>
            {SORTS.map(s => (
              <button key={s.key} className={sort === s.key ? 'sort-chip active' : 'sort-chip'} onClick={() => setSort(s.key)}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="search-wrap">
            <Search size={14} strokeWidth={2.2} color="#717971" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hotel…" className="input-field" style={{ padding: '10px 14px 10px 42px', fontSize: 13 }} />
          </div>
        </div>

        <div className="board-layout">
          {/* Filters sidebar */}
          <aside className="filters-panel">
            <div className="fp-head">
              <span><SlidersHorizontal size={15} strokeWidth={2.4} /> Filters</span>
              <button className="fp-reset" onClick={resetAll}>Reset all</button>
            </div>

            <div className="fp-group">
              <div className="fp-label">Location</div>
              <div className="fp-chips">
                {LOCATIONS.map(loc => (
                  <button key={loc.value} className={filter === loc.value ? 'fp-chip active' : 'fp-chip'}
                    onClick={() => setFilter(loc.value as Location | 'all')}>
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="fp-group">
              <div className="fp-label">Property type</div>
              <div className="fp-chips">
                {PROP_OPTS.map(p => (
                  <button key={p.key} className={propFilter === p.key ? 'fp-chip active' : 'fp-chip'}
                    onClick={() => setPropFilter(p.key)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <p.Icon size={11} strokeWidth={2.3} /> {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="fp-group">
              <div className="fp-label">Rates</div>
              <div className="fp-chips">
                <button className={seasonalOnly ? 'fp-chip active' : 'fp-chip'}
                  onClick={() => setSeasonalOnly(v => !v)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  aria-pressed={seasonalOnly}>
                  <CalendarRange size={11} strokeWidth={2.3} /> Seasonal only
                </button>
              </div>
            </div>

            <div className="fp-group">
              <div className="fp-label">Price / night (₹)</div>
              <div className="fp-price">
                <input type="number" min={0} inputMode="numeric" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
                <span style={{ color: '#9dabae' }}>–</span>
                <input type="number" min={0} inputMode="numeric" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
              </div>
            </div>

            <div className="fp-group">
              <div className="fp-label">Amenities</div>
              <div className="fp-checks">
                {AMENITY_OPTS.map(a => (
                  <label key={a} className="fp-check">
                    <input type="checkbox" checked={amenitySel.includes(a)} onChange={() => toggleAmenity(a)} />
                    {a}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="results-col">
            {error && (
              <div className="card" style={{ padding: '20px 24px', marginBottom: 24, borderLeft: '4px solid #ba1a1a', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', color: '#93000a' }}>
                <strong style={{ display: 'block', marginBottom: 4 }}>Couldn&apos;t load hotels</strong>
                <span style={{ fontSize: 13 }}>{error}</span>
              </div>
            )}

            {hotels.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                <Mountain size={40} color="#c1c9bf" style={{ display: 'block', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 22, fontWeight: 700, color: '#414942', marginBottom: 8 }}>No hotels published yet</p>
                <p style={{ fontSize: 14, fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', color: '#717971' }}>Approved hotel listings will appear here in real-time.</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                <Search size={40} color="#c1c9bf" style={{ display: 'block', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 22, fontWeight: 700, color: '#414942', marginBottom: 8 }}>No hotels found</p>
                <p style={{ fontSize: 14, fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', color: '#717971' }}>Try adjusting your filters, price range or search term.</p>
              </div>
            ) : (
              <div className="hotel-grid">
                {sorted.map((hotel, i) => (
                  <HotelCard key={hotel.id} hotel={hotel} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
