'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import HotelCard from '@/components/HotelCard'
import KashmirLive from '@/components/KashmirLive'
import { Hotel, LOCATIONS, Location, PropertyType } from '@/lib/data'
import { browserSupabase } from '@/lib/supabase'

type PropFilter = 'all' | PropertyType

export default function PublicPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [filter, setFilter] = useState<Location | 'all'>('all')
  const [propFilter, setPropFilter] = useState<PropFilter>('all')
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const res = await fetch('/api/hotels', { cache: 'no-store' })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      setHotels(json.hotels ?? [])
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  useEffect(() => {
    setMounted(true)
    refresh()

    // Real-time: any change to hotels or rooms triggers a refetch
    let sb: ReturnType<typeof browserSupabase> | null = null
    try { sb = browserSupabase() } catch { /* env vars missing in dev */ }
    if (!sb) return

    const channel = sb.channel('public-hotels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hotels' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms'  }, refresh)
      .subscribe()
    return () => { sb!.removeChannel(channel) }
  }, [])

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
        <section className="hero-section">
          <i className="fi fi-rr-mountains" style={{
            position: 'absolute', right: -30, top: -20,
            fontSize: 280, color: 'rgba(184,240,197,0.08)', pointerEvents: 'none',
          }} />

          <div className="hero-live-badge">
            <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#b8f0c5', display: 'inline-block' }} />
            {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'} live
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <i className="fi fi-rr-leaf" style={{ fontSize: 18, color: '#b8f0c5' }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9dd3aa', fontFamily: 'Inter, sans-serif' }}>
              Kashmir B2B Rate Portal
            </span>
          </div>

          <h1 className="hero-title">
            No More<br />
            <span style={{ color: '#9dd3aa' }}>Back-and-Forth.</span>
          </h1>
          <p className="hero-subtitle">
            Hotels publish once. Agents book confidently.<br />
            Live B2B rates across Srinagar, Houseboats, Gulmarg, Pahalgam, Sonamarg &amp; Gurez.
          </p>

          <div className="hero-meta-row" style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 28, flexWrap: 'wrap' }}>
            {[
              { icon: 'fi-rr-check-circle', text: 'Live rates, zero calls' },
              { icon: 'fi-rr-eye', text: 'No login for agents' },
              { icon: 'fi-rr-clock', text: 'Updated in real-time' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.88)', fontFamily: 'Inter, sans-serif' }}>
                <i className={`fi ${m.icon}`} style={{ fontSize: 14, color: '#b8f0c5' }} />
                {m.text}
              </div>
            ))}
          </div>
        </section>

        <KashmirLive />

        <div className="filter-row">
          <span className="t-overline" style={{ marginRight: 6 }}>
            <i className="fi fi-rr-filter" style={{ fontSize: 11, marginRight: 6, verticalAlign: 'middle' }} />
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
            <i className="fi fi-rr-search" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#717971', pointerEvents: 'none', zIndex: 1 }} />
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
              <i className="fi fi-rr-filter" style={{ fontSize: 11, marginRight: 6, verticalAlign: 'middle' }} />
              Property
            </span>
            {([
              { key: 'all',       label: 'All',        icon: 'fi-rr-grid' },
              { key: 'hotel',     label: 'Hotels',     icon: 'fi-rr-building' },
              { key: 'houseboat', label: 'Houseboats', icon: 'fi-rr-sailboat' },
            ] as { key: PropFilter; label: string; icon: string }[]).map(p => {
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
                  <i className={`fi ${p.icon}`} style={{ fontSize: 11 }} />
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
            <i className="fi fi-rr-mountains" style={{ fontSize: 40, color: '#c1c9bf', marginBottom: 12, display: 'block' }} />
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#414942', marginBottom: 8 }}>No hotels published yet</p>
            <p style={{ fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#717971' }}>Approved hotel listings will appear here in real-time.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
            <i className="fi fi-rr-search" style={{ fontSize: 40, color: '#c1c9bf', marginBottom: 12, display: 'block' }} />
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
