'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import Header from '@/components/Header'
import HotelCard from '@/components/HotelCard'
import Toast, { ToastMessage } from '@/components/Toast'
import { HotelsMap, LOCATIONS, Location } from '@/lib/data'
import { loadHotels, LS_SYNC_KEY } from '@/lib/storage'

export default function PublicPage() {
  const router = useRouter()
  const { isSignedIn, signOut } = useAuth()
  const [hotels, setHotels] = useState<HotelsMap>({})
  const [filter, setFilter] = useState<Location | 'all'>('all')
  const [search, setSearch] = useState('')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const h = loadHotels()
    setHotels(h)
    setMounted(true)

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_SYNC_KEY) setHotels(loadHotels())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleLogout = () => {
    signOut(() => {
      addToast('Signed out successfully', 'info')
    })
  }

  const hotelList = Object.values(hotels)
  const filtered = hotelList.filter(h => {
    const locMatch = filter === 'all' || h.location === filter || h.locationLabel.toLowerCase().includes(filter)
    const s = search.toLowerCase().trim()
    const searchMatch = !s || h.name.toLowerCase().includes(s) || h.locationLabel.toLowerCase().includes(s)
    return locMatch && searchMatch
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
      <Header isLoggedIn={!!isSignedIn} onLogout={handleLogout} />

      <main className="app-shell">
        {/* Hero */}
        <section className="hero-section">
          <i className="fi fi-rr-mountains" style={{
            position: 'absolute', right: -30, top: -20,
            fontSize: 280, color: 'rgba(184,240,197,0.08)', pointerEvents: 'none',
          }} />

          <div className="hero-live-badge">
            <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#b8f0c5', display: 'inline-block' }} />
            {hotelList.length} hotels live
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <i className="fi fi-rr-leaf" style={{ fontSize: 18, color: '#b8f0c5' }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9dd3aa', fontFamily: 'Inter, sans-serif' }}>
              Verified B2B Rates · Updated Daily
            </span>
          </div>

          <h1 className="hero-title">
            Kashmir Hotel Rates<br />
            <span style={{ color: '#9dd3aa' }}>for Travel Agents</span>
          </h1>
          <p className="hero-subtitle">
            Direct B2B net rates from hotels across Srinagar, Dal Lake, Gulmarg, Pahalgam, Sonamarg and Gurez. Updated in real-time. No markup, no middleman.
          </p>

          <div className="hero-meta-row" style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 28, flexWrap: 'wrap' }}>
            {[
              { icon: 'fi-rr-clock', text: 'Live rates updated today' },
              { icon: 'fi-rr-shield-check', text: 'No login required' },
              { icon: 'fi-rr-phone-call', text: 'Direct hotel contact' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.88)', fontFamily: 'Inter, sans-serif' }}>
                <i className={`fi ${m.icon}`} style={{ fontSize: 14, color: '#b8f0c5' }} />
                {m.text}
              </div>
            ))}
          </div>
        </section>

        {/* Filters */}
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
                onClick={() => setFilter(loc.value as Location | 'all')}
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
            {filtered.length} of {hotelList.length}
          </span>
        </div>

        {/* Hotel Grid */}
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
            <i className="fi fi-rr-search" style={{ fontSize: 40, color: '#c1c9bf', marginBottom: 12, display: 'block' }} />
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#414942', marginBottom: 8 }}>No Hotels Found</p>
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

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  )
}
