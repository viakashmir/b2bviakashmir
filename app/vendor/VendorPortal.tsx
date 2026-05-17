'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import Header from '@/components/Header'
import Toast, { ToastMessage } from '@/components/Toast'
import OnboardingFlow from './OnboardingFlow'
import { Hotel, Room, MealPlan, RoomCategory, MEAL_LABELS, ROOM_CATEGORIES, STAR_LABELS, AMENITIES_LIST } from '@/lib/data'
import { loadHotels, saveHotels, fmtDate, timeAgo, fmtINR, availableInventory, totalInventory, LS_SYNC_KEY } from '@/lib/storage'

/** Hotel id is derived from the Clerk user id — no admin action needed. */
function deriveHotelId(userId: string): string {
  return `vendor_${userId.toLowerCase()}`
}

export default function VendorPortal() {
  const { user, isLoaded } = useUser()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [hotels, setHotels] = useState<ReturnType<typeof loadHotels>>({})
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [savedRows, setSavedRows] = useState<Set<number>>(new Set())
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<'rooms' | 'profile'>('rooms')
  const [onboardingTick, setOnboardingTick] = useState(0)

  const [newRoom, setNewRoom] = useState({
    type: '', category: 'Deluxe' as RoomCategory, meal: 'CP' as MealPlan,
    double: '', cnb: '', extraBed: '', inventory: '',
    status: 'Available' as Room['status'],
  })
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user) return
    const hotelId = deriveHotelId(user.id)
    const h = loadHotels()
    setHotels(h)
    setMounted(true)
    setHotel(h[hotelId] ?? null)

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_SYNC_KEY) {
        const updated = loadHotels()
        setHotels(updated)
        setHotel(updated[hotelId] ?? null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [isLoaded, user, onboardingTick])

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    setToasts(prev => [...prev, { id: Date.now().toString() + Math.random(), message, type }])
  }, [])

  const persist = useCallback((updated: Hotel) => {
    const next = { ...hotels, [updated.id]: updated }
    setHotels(next)
    saveHotels(next)
  }, [hotels])

  const cellChange = (idx: number, field: keyof Room, value: string) => {
    if (!hotel) return
    const rooms = [...hotel.rooms]
    const room = { ...rooms[idx] }
    if (['double', 'cnb', 'extraBed', 'inventory'].includes(field)) {
      ;(room as Record<string, unknown>)[field] = parseInt(value) || 0
    } else {
      ;(room as Record<string, unknown>)[field] = value
    }
    rooms[idx] = room
    setHotel({ ...hotel, rooms })
    setSavedRows(prev => { const s = new Set(prev); s.delete(idx); return s })
  }

  const saveRow = (idx: number) => {
    if (!hotel) return
    const rooms = [...hotel.rooms]
    rooms[idx] = { ...rooms[idx], updatedAt: Date.now() }
    const updated = { ...hotel, rooms, updatedAt: Date.now() }
    setHotel(updated)
    persist(updated)
    setSavedRows(prev => new Set(prev).add(idx))
    setTimeout(() => setSavedRows(prev => { const s = new Set(prev); s.delete(idx); return s }), 2500)
    addToast('Rate saved · Live on public board', 'success')
  }

  const deleteRow = (idx: number) => {
    if (!hotel) return
    const name = hotel.rooms[idx]?.type
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const rooms = hotel.rooms.filter((_, i) => i !== idx)
    const updated = { ...hotel, rooms, updatedAt: Date.now() }
    setHotel(updated)
    persist(updated)
    addToast(`"${name}" removed`, 'info')
  }

  const addRoom = () => {
    if (!hotel) return
    setFormError('')
    if (!newRoom.type.trim()) { setFormError('Room type name is required.'); return }
    if (!newRoom.double) { setFormError('Double rate is required.'); return }
    const room: Room = {
      id: 'r' + Date.now(),
      type: newRoom.type.trim(),
      category: newRoom.category,
      meal: newRoom.meal,
      double: parseInt(newRoom.double) || 0,
      cnb: parseInt(newRoom.cnb) || 0,
      extraBed: parseInt(newRoom.extraBed) || 0,
      inventory: parseInt(newRoom.inventory) || 0,
      status: newRoom.status,
      updatedAt: Date.now(),
    }
    const updated = { ...hotel, rooms: [...hotel.rooms, room], updatedAt: Date.now() }
    setHotel(updated)
    persist(updated)
    setNewRoom({ type: '', category: 'Deluxe', meal: 'CP', double: '', cnb: '', extraBed: '', inventory: '', status: 'Available' })
    setShowForm(false)
    addToast(`"${room.type}" added · Now live`, 'success')
  }

  const updateProfile = (patch: Partial<Hotel>) => {
    if (!hotel) return
    const updated = { ...hotel, ...patch, updatedAt: Date.now() }
    setHotel(updated)
    persist(updated)
  }

  const toggleAmenity = (a: string) => {
    if (!hotel) return
    const set = new Set(hotel.amenities)
    if (set.has(a)) set.delete(a); else set.add(a)
    updateProfile({ amenities: Array.from(set) })
  }

  const saveProfile = () => {
    if (!hotel) return
    addToast('Profile saved', 'success')
  }

  const statusClass = (s: string) => s === 'Available' ? 'avail' : s === 'Limited' ? 'limited' : 'sold'

  if (!mounted || !isLoaded || !user) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', opacity: 0.5 }}>Loading…</div>
      </div>
    )
  }

  // First-time vendor — no hotel record yet → run the onboarding flow.
  if (!hotel) {
    const hotelId = deriveHotelId(user.id)
    const defaultName = user.firstName || user.username || ''
    const defaultEmail = user.primaryEmailAddress?.emailAddress || ''
    return (
      <>
        <Header />
        <OnboardingFlow
          hotelId={hotelId}
          defaultName={defaultName}
          defaultEmail={defaultEmail}
          onComplete={() => setOnboardingTick(t => t + 1)}
        />
      </>
    )
  }

  const availInv = availableInventory(hotel.rooms)
  const totalInv = totalInventory(hotel.rooms)
  const avgDbl = hotel.rooms.length ? Math.round(hotel.rooms.reduce((a, r) => a + r.double, 0) / hotel.rooms.length) : 0
  const availTypes = hotel.rooms.filter(r => r.status === 'Available').length
  const soldTypes = hotel.rooms.filter(r => r.status === 'Sold Out').length

  return (
    <>
      <Header />
      <main className="app-shell">
        <div className="dash-header">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>
              <i className="fi fi-rr-building" style={{ fontSize: 11 }} /> {STAR_LABELS[hotel.stars]}
            </span>
            <h1 className="dash-title">{hotel.name}</h1>
            <p style={{ fontSize: 14, color: '#414942', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {hotel.locationLabel} · {hotel.phone}
              {!hotel.approved && (
                <span className="badge badge-tertiary" style={{ marginLeft: 12 }}>
                  <i className="fi fi-rr-clock" style={{ fontSize: 10 }} /> Pending approval
                </span>
              )}
            </p>
          </div>
          <div className="dash-actions">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600,
              color: '#414942', padding: '10px 18px', background: '#ffffff', borderRadius: 9999,
              fontFamily: 'Inter, sans-serif', boxShadow: '0 1px 3px rgba(25,28,29,0.04)',
            }}>
              <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#13677b', display: 'inline-block' }} />
              <i className="fi fi-rr-clock" style={{ fontSize: 12, opacity: 0.6 }} />
              {fmtDate(hotel.updatedAt)}
            </div>
            <a href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ padding: '10px 18px', fontSize: 13 }}>
                <i className="fi fi-rr-eye" style={{ fontSize: 13 }} /> View Live
              </button>
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #edeeef', paddingBottom: 0 }}>
          {([
            { key: 'rooms', label: 'Rooms & Rates', icon: 'fi-rr-bed-alt' },
            { key: 'profile', label: 'Profile', icon: 'fi-rr-id-card-clip-alt' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '12px 18px', border: 'none', background: 'transparent',
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
                color: tab === t.key ? '#00361a' : '#717971', cursor: 'pointer',
                borderBottom: tab === t.key ? '3px solid #00361a' : '3px solid transparent',
                marginBottom: -1, display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <i className={`fi ${t.icon}`} style={{ fontSize: 13 }} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'rooms' && (
          <>
            <div className="stat-grid">
              {[
                { label: 'Rooms Available Today', value: String(availInv), sub: `${availTypes} types open`, icon: 'fi-rr-bed-alt', accent: '#13677b' },
                { label: 'Total Inventory', value: String(totalInv), sub: `${soldTypes} sold out`, icon: 'fi-rr-chart-line-up', accent: '#00361a' },
                { label: 'Avg Double Rate', value: fmtINR(avgDbl), sub: 'Per night · net B2B', icon: 'fi-rr-coins', accent: '#f09f5e' },
                { label: 'Last Updated', value: timeAgo(hotel.updatedAt), sub: fmtDate(hotel.updatedAt), icon: 'fi-rr-clock', accent: '#00361a', small: true },
              ].map((c, i) => (
                <div key={i} className="card-elevated" style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div className="t-overline">{c.label}</div>
                    <div style={{ width: 36, height: 36, borderRadius: 9999, background: '#f3f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`fi ${c.icon}`} style={{ fontSize: 16, color: c.accent }} />
                    </div>
                  </div>
                  <div className={`stat-value${c.small ? ' small' : ''}`}>{c.value}</div>
                  <div style={{ fontSize: 12, color: '#717971', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 700, color: '#00361a', letterSpacing: '-0.02em' }}>
                  Room Rates &amp; Inventory
                </div>
                <div style={{ fontSize: 13, color: '#717971', marginTop: 4, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  All rates in ₹ per night · B2B Net · Click any value to edit
                </div>
              </div>
              <button onClick={() => setShowForm(f => !f)} className="btn-primary" style={{ padding: '12px 22px', fontSize: 13 }}>
                <i className="fi fi-rr-plus" style={{ fontSize: 13 }} /> Add Room Type
              </button>
            </div>

            <div className="card-elevated table-scroll" style={{ overflow: 'auto', marginBottom: 32 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)' }}>
                    {['Room', 'Category', 'Meal', 'Double ₹', 'CNB ₹', 'Extra Bed ₹', 'Avail.', 'Status', ''].map((h, i) => (
                      <th key={i} style={{
                        padding: '14px 16px', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)',
                        textAlign: i >= 3 && i <= 6 ? 'right' : 'left',
                        fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hotel.rooms.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '48px 20px', color: '#717971', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500 }}>
                        <i className="fi fi-rr-bed-alt" style={{ fontSize: 28, color: '#c1c9bf', display: 'block', marginBottom: 8 }} />
                        No room types yet. Add your first room type above.
                      </td>
                    </tr>
                  ) : hotel.rooms.map((room, idx) => (
                    <tr key={room.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f3f4f5'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#191c1d', fontFamily: 'Inter, sans-serif' }}>{room.type}</div>
                        <div style={{ fontSize: 11, color: '#717971', fontWeight: 500, marginTop: 3, fontFamily: 'Inter, sans-serif' }}>{MEAL_LABELS[room.meal]}</div>
                      </td>
                      <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                        <select
                          className="input-field"
                          defaultValue={room.category}
                          onChange={e => cellChange(idx, 'category', e.target.value)}
                          style={{ padding: '6px 10px', fontSize: 12, width: 'auto' }}
                        >
                          {ROOM_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#414942', fontFamily: 'Inter, sans-serif', fontWeight: 600, background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                        <select
                          className="input-field"
                          defaultValue={room.meal}
                          onChange={e => cellChange(idx, 'meal', e.target.value)}
                          style={{ padding: '6px 10px', fontSize: 12, width: 'auto' }}
                        >
                          <option value="CP">CP</option>
                          <option value="MAP">MAP</option>
                          <option value="AP">AP</option>
                          <option value="EP">EP</option>
                        </select>
                      </td>
                      {(['double','cnb','extraBed'] as const).map(field => (
                        <td key={field} style={{ padding: '14px 16px', textAlign: 'right', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                          <input
                            className="editable-cell"
                            type="number"
                            defaultValue={room[field] ?? ''}
                            placeholder="—"
                            min={0}
                            onChange={e => cellChange(idx, field, e.target.value)}
                          />
                        </td>
                      ))}
                      <td style={{ padding: '14px 16px', textAlign: 'right', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                        <input
                          className="editable-cell inv"
                          type="number"
                          defaultValue={room.inventory}
                          min={0}
                          onChange={e => cellChange(idx, 'inventory', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                        <select
                          className={`status-select ${statusClass(room.status)}`}
                          defaultValue={room.status}
                          onChange={e => {
                            cellChange(idx, 'status', e.target.value)
                            e.target.className = `status-select ${statusClass(e.target.value)}`
                          }}
                        >
                          <option>Available</option>
                          <option>Limited</option>
                          <option>Sold Out</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => saveRow(idx)}
                            className={savedRows.has(idx) ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: '7px 14px', fontSize: 11 }}
                          >
                            {savedRows.has(idx) ? (<><i className="fi fi-rs-check-circle" style={{ fontSize: 11 }} /> Saved</>) : (<><i className="fi fi-rr-disk" style={{ fontSize: 11 }} /> Save</>)}
                          </button>
                          <button
                            onClick={() => deleteRow(idx)}
                            style={{
                              width: 34, height: 34, borderRadius: 9999, border: 'none',
                              background: '#ffdad6', color: '#93000a', cursor: 'pointer',
                              transition: 'all 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ba1a1a'; (e.currentTarget as HTMLElement).style.color = '#ffffff' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffdad6'; (e.currentTarget as HTMLElement).style.color = '#93000a' }}
                            aria-label="Delete row"
                          >
                            <i className="fi fi-rr-trash" style={{ fontSize: 14 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showForm && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 700, color: '#00361a', marginBottom: 12 }}>Add New Room Type</div>
                <div className="card-elevated" style={{ padding: 24 }}>
                  <div className="form-grid">
                    {[
                      { label: 'Room Type *', field: 'type', type: 'text', placeholder: 'Deluxe Room' },
                      { label: 'Double ₹ *', field: 'double', type: 'number', placeholder: '6500' },
                      { label: 'CNB ₹', field: 'cnb', type: 'number', placeholder: '1200' },
                      { label: 'Extra Bed ₹', field: 'extraBed', type: 'number', placeholder: '1800' },
                      { label: 'Rooms', field: 'inventory', type: 'number', placeholder: '10' },
                    ].map(f => (
                      <div key={f.field}>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#414942', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>{f.label}</label>
                        <input
                          type={f.type}
                          value={(newRoom as Record<string, string>)[f.field]}
                          onChange={e => setNewRoom(p => ({ ...p, [f.field]: e.target.value }))}
                          placeholder={f.placeholder}
                          className="input-field"
                          style={{ padding: '11px 14px', fontSize: 13 }}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#414942', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Category</label>
                      <select
                        value={newRoom.category}
                        onChange={e => setNewRoom(p => ({ ...p, category: e.target.value as RoomCategory }))}
                        className="input-field"
                        style={{ padding: '11px 14px', fontSize: 13 }}
                      >
                        {ROOM_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#414942', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Meal Plan</label>
                      <select
                        value={newRoom.meal}
                        onChange={e => setNewRoom(p => ({ ...p, meal: e.target.value as MealPlan }))}
                        className="input-field"
                        style={{ padding: '11px 14px', fontSize: 13 }}
                      >
                        <option value="CP">CP — Breakfast</option>
                        <option value="MAP">MAP — B&amp;D</option>
                        <option value="AP">AP — All Meals</option>
                        <option value="EP">EP — No Meals</option>
                      </select>
                    </div>
                  </div>
                  {formError && (
                    <p style={{ fontSize: 12, color: '#93000a', margin: '4px 0 12px', fontFamily: 'Inter, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="fi fi-rs-exclamation" style={{ fontSize: 13 }} /> {formError}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={addRoom} className="btn-primary" style={{ padding: '12px 24px', fontSize: 13 }}>
                      <i className="fi fi-rr-plus" style={{ fontSize: 13 }} /> Add Room Type
                    </button>
                    <button onClick={() => { setShowForm(false); setFormError('') }} className="btn-secondary" style={{ padding: '12px 22px', fontSize: 13 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'profile' && (
          <div className="card-elevated" style={{ padding: 28, marginBottom: 32 }}>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', letterSpacing: '-0.02em', marginBottom: 6 }}>
              Hotel Profile
            </div>
            <p style={{ fontSize: 13, color: '#717971', margin: '0 0 24px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Public information shown on the rates board and Enquire modal.
            </p>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
              {[
                { label: 'Hotel Name', key: 'name' as const },
                { label: 'Phone', key: 'phone' as const },
                { label: 'Email', key: 'email' as const },
                { label: 'Website', key: 'website' as const },
                { label: 'Address', key: 'address' as const, full: true },
                { label: 'Description', key: 'description' as const, full: true, multi: true },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? '1 / -1' : undefined }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#414942', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>{f.label}</label>
                  {f.multi ? (
                    <textarea
                      value={((hotel as unknown) as Record<string, unknown>)[f.key] as string || ''}
                      onChange={e => updateProfile({ [f.key]: e.target.value } as Partial<Hotel>)}
                      className="input-field"
                      rows={3}
                      style={{ padding: '11px 14px', fontSize: 13, resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={((hotel as unknown) as Record<string, unknown>)[f.key] as string || ''}
                      onChange={e => updateProfile({ [f.key]: e.target.value } as Partial<Hotel>)}
                      className="input-field"
                      style={{ padding: '11px 14px', fontSize: 13 }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#414942', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>Amenities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {AMENITIES_LIST.map(a => {
                  const active = hotel.amenities.includes(a)
                  return (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      style={{
                        padding: '8px 14px', borderRadius: 9999, border: 'none',
                        background: active ? 'linear-gradient(135deg, #00361a, #1a4d2e)' : '#f3f4f5',
                        color: active ? '#ffffff' : '#414942',
                        fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.18s',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <i className={`fi ${active ? 'fi-rs-check-circle' : 'fi-rr-plus-small'}`} style={{ fontSize: 12 }} />
                      {a}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <button onClick={saveProfile} className="btn-primary" style={{ padding: '12px 24px', fontSize: 13 }}>
                <i className="fi fi-rr-disk" style={{ fontSize: 13 }} /> Save Profile
              </button>
            </div>
          </div>
        )}
      </main>
      <Toast toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </>
  )
}
