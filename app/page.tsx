'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mountain, Leaf, Filter,
  Search, Grid3x3, Building2, Sailboat,
} from 'lucide-react'
import Header from '@/components/Header'
import HotelCard from '@/components/HotelCard'
import KashmirLive from '@/components/KashmirLive'
import { Hotel, LOCATIONS, Location, PropertyType, rowToHotel } from '@/lib/data'
import { browserSupabase } from '@/lib/supabase'

type PropFilter = 'all' | PropertyType

export default function PublicPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [filter, setFilter] = useState<Location | 'all'>('all')
  const [propFilter, setPropFilter] = useState<PropFilter>('all')
  const [search, setSearch] = useState('')
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
    // Property-type filter only applies to Srinagar (other cities are hotels-only)
    const propMatch =
      filter !== 'srinagar' || propFilter === 'all' || h.propertyType === propFilter
    const s = search.toLowerCase().trim()
    const searchMatch = !s || h.name.toLowerCase().includes(s) || h.locationLabel.toLowerCase().includes(s)
    return locMatch && propMatch && searchMatch
  })

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', opacity: 0.5 }}>Loading rates…</div>
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

        <div className="filter-row">
          <span className="t-overline" style={{ marginRight: 6 }}>
            <Filter size={11} strokeWidth={2.5} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Location
          </span>
          {LOCATIONS.map(loc => {
            const active = filter === loc.value
            return (
              <button
                key={loc.value}
                onClick={() => { setFilter(loc.value as Location | 'all'); if (loc.value !== 'srinagar') setPropFilter('all') }}
                style={{
                  padding: '8px 16px', borderRadius: 9999, border: 'none',
                  background: active ? 'linear-gradient(135deg, #00361a, #1a4d2e)' : '#ffffff',
                  color: active ? '#ffffff' : '#414942',
                  fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.18s',
                  boxShadow: active ? '0 4px 16px rgba(0,54,26,0.18)' : '0 1px 3px rgba(25,28,29,0.04)',
                }}
              >
                {loc.label}
              </button>
            )
          })}

          <div className="search-wrap">
            <Search size={14} strokeWidth={2.2} color="#717971" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search hotel…"
              className="input-field"
              style={{ padding: '10px 14px 10px 42px', fontSize: 13 }}
            />
          </div>

          <span className="filter-count" style={{ fontSize: 12, color: '#717971', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            {filtered.length} of {hotels.length}
          </span>
        </div>

        {/* Srinagar sub-filter: Hotels / Houseboats */}
        {filter === 'srinagar' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: -12, marginBottom: 28, flexWrap: 'wrap' }}>
            <span className="t-overline" style={{ marginRight: 6 }}>
              <Filter size={11} strokeWidth={2.5} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Property
            </span>
            {([
              { key: 'all',       label: 'All',        Icon: Grid3x3 },
              { key: 'hotel',     label: 'Hotels',     Icon: Building2 },
              { key: 'houseboat', label: 'Houseboats', Icon: Sailboat },
            ] as { key: PropFilter; label: string; Icon: typeof Grid3x3 }[]).map(p => {
              const active = propFilter === p.key
              return (
                <button
                  key={p.key}
                  onClick={() => setPropFilter(p.key)}
                  style={{
                    padding: '7px 14px', borderRadius: 9999, border: 'none',
                    background: active ? 'linear-gradient(135deg, #13677b, #18697e)' : '#f3f4f5',
                    color: active ? '#ffffff' : '#414942',
                    fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.18s',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <p.Icon size={11} strokeWidth={2.3} />
                  {p.label}
                </button>
              )
            })}
          </div>
        )}

        {error && (
          <div className="card" style={{ padding: '20px 24px', marginBottom: 24, borderLeft: '4px solid #ba1a1a', fontFamily: 'Inter, sans-serif', color: '#93000a' }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>Couldn&apos;t load hotels</strong>
            <span style={{ fontSize: 13 }}>{error}</span>
          </div>
        )}

        {hotels.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
            <Mountain size={40} color="#c1c9bf" style={{ display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#414942', marginBottom: 8 }}>No hotels published yet</p>
            <p style={{ fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#717971' }}>Approved hotel listings will appear here in real-time.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
            <Search size={40} color="#c1c9bf" style={{ display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#414942', marginBottom: 8 }}>No hotels found</p>
            <p style={{ fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#717971' }}>Try adjusting your location filter or search term.</p>
          </div>
        ) : (
          <div className="hotel-grid">
            {filtered.map((hotel, i) => (
              <HotelCard key={hotel.id} hotel={hotel} index={i} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
