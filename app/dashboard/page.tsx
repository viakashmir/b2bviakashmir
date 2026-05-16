'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import StarRating from '@/components/StarRating'
import Toast, { ToastMessage } from '@/components/Toast'
import { Hotel, Room, MealPlan, MEAL_LABELS } from '@/lib/data'
import { loadHotels, saveHotels, loadSession, clearSession, fmtDate, timeAgo, fmtINR, availableInventory, totalInventory, LS_SYNC_KEY } from '@/lib/storage'

const STAR_LABELS: Record<number, string> = { 1: '1 Star', 2: '2 Star', 3: '3 Star', 4: '4 Star', 5: '5 Star Deluxe' }

export default function DashboardPage() {
  const router = useRouter()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [hotels, setHotels] = useState<ReturnType<typeof loadHotels>>({})
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [pendingChanges, setPendingChanges] = useState<Set<number>>(new Set())
  const [savedRows, setSavedRows] = useState<Set<number>>(new Set())
  const [mounted, setMounted] = useState(false)

  const [newRoom, setNewRoom] = useState({ type: '', meal: 'CP' as MealPlan, single: '', double: '', triple: '', inventory: '', status: 'Available' as Room['status'] })
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const session = loadSession()
    if (!session) { router.push('/login'); return }
    const h = loadHotels()
    const currentHotel = h[session.hotelId]
    if (!currentHotel) { clearSession(); router.push('/login'); return }
    setHotels(h)
    setHotel(currentHotel)
    setMounted(true)

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_SYNC_KEY) {
        const updated = loadHotels()
        setHotels(updated)
        const updatedHotel = updated[session.hotelId]
        if (updatedHotel) setHotel(updatedHotel)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [router])

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const handleLogout = () => {
    clearSession()
    router.push('/')
  }

  const persist = useCallback((updatedHotel: Hotel) => {
    const updatedHotels = { ...hotels, [updatedHotel.id]: updatedHotel }
    setHotels(updatedHotels)
    saveHotels(updatedHotels)
  }, [hotels])

  const cellChange = (idx: number, field: keyof Room, value: string) => {
    if (!hotel) return
    const rooms = [...hotel.rooms]
    const room = { ...rooms[idx] }
    if (['single','double','triple','inventory'].includes(field)) {
      (room as Record<string, unknown>)[field] = parseInt(value) || 0
    } else {
      (room as Record<string, unknown>)[field] = value
    }
    rooms[idx] = room
    const updated = { ...hotel, rooms }
    setHotel(updated)
    setPendingChanges(prev => new Set(prev).add(idx))
    setSavedRows(prev => { const s = new Set(prev); s.delete(idx); return s })
  }

  const saveRow = (idx: number) => {
    if (!hotel) return
    const updated = { ...hotel, updatedAt: Date.now() }
    setHotel(updated)
    persist(updated)
    setPendingChanges(prev => { const s = new Set(prev); s.delete(idx); return s })
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
      meal: newRoom.meal,
      single: parseInt(newRoom.single) || 0,
      double: parseInt(newRoom.double) || 0,
      triple: newRoom.triple ? parseInt(newRoom.triple) : null,
      inventory: parseInt(newRoom.inventory) || 0,
      status: newRoom.status,
    }
    const rooms = [...hotel.rooms, room]
    const updated = { ...hotel, rooms, updatedAt: Date.now() }
    setHotel(updated)
    persist(updated)
    setNewRoom({ type: '', meal: 'CP', single: '', double: '', triple: '', inventory: '', status: 'Available' })
    setShowForm(false)
    addToast(`"${room.type}" added · Now live`, 'success')
  }

  const statusClass = (s: string) => s === 'Available' ? 'avail' : s === 'Limited' ? 'limited' : 'sold'

  if (!mounted || !hotel) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', opacity: 0.5 }}>Loading dashboard…</div>
      </div>
    )
  }

  const availInv = availableInventory(hotel.rooms)
  const totalInv = totalInventory(hotel.rooms)
  const avgDbl = hotel.rooms.length ? Math.round(hotel.rooms.reduce((a, r) => a + r.double, 0) / hotel.rooms.length) : 0
  const availTypes = hotel.rooms.filter(r => r.status === 'Available').length
  const soldTypes = hotel.rooms.filter(r => r.status === 'Sold Out').length

  const statCards = [
    { label: 'Rooms Available Today', value: String(availInv), sub: `${availTypes} room types open for booking`, icon: 'fi-rr-bed-alt', accent: '#13677b' },
    { label: 'Total Inventory', value: String(totalInv), sub: `${soldTypes} type(s) sold out`, icon: 'fi-rr-chart-line-up', accent: '#00361a' },
    { label: 'Avg B2B Double Rate', value: fmtINR(avgDbl), sub: 'Per night · net B2B rate', icon: 'fi-rr-coins', accent: '#f09f5e' },
    { label: 'Prices Last Updated', value: timeAgo(hotel.updatedAt), sub: fmtDate(hotel.updatedAt), icon: 'fi-rr-clock', accent: '#00361a', small: true },
  ]

  return (
    <>
      <Header isLoggedIn={true} onLogout={handleLogout} />

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '40px', position: 'relative' }}>

        {/* Dash header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
              <StarRating stars={hotel.stars} size={14} variant="dark" showLabel />
            </div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 44, fontWeight: 800, color: '#00361a', lineHeight: 1.05, letterSpacing: '-0.025em', margin: 0 }}>
              {hotel.name}
            </h1>
            <p style={{ fontSize: 14, color: '#414942', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {hotel.locationLabel} · {STAR_LABELS[hotel.stars]} · {hotel.phone}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
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
            <button onClick={handleLogout} className="btn-danger" style={{ padding: '10px 18px', fontSize: 13 }}>
              <i className="fi fi-rr-sign-out-alt" style={{ fontSize: 13 }} /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
          {statCards.map((card, i) => (
            <div key={i} className="card-elevated" style={{ padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="t-overline">{card.label}</div>
                <div style={{ width: 36, height: 36, borderRadius: 9999, background: '#f3f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fi ${card.icon}`} style={{ fontSize: 16, color: card.accent }} />
                </div>
              </div>
              <div style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: card.small ? 22 : 36,
                fontWeight: 800, color: '#00361a', lineHeight: 1, letterSpacing: '-0.025em',
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: 12, color: '#717971', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Rates table section */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 700, color: '#00361a', letterSpacing: '-0.02em' }}>
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

          <div className="card-elevated" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)' }}>
                  {['Room Type', 'Meal Plan', 'Single ₹', 'Double ₹', 'Triple ₹', 'Rooms Avail.', 'Status', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '14px 16px', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)',
                      textAlign: i >= 2 && i <= 5 ? 'right' : 'left',
                      fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hotel.rooms.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px', color: '#717971', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500 }}>
                      <i className="fi fi-rr-bed-alt" style={{ fontSize: 28, color: '#c1c9bf', display: 'block', marginBottom: 8 }} />
                      No room types yet. Add your first room type above.
                    </td>
                  </tr>
                ) : (
                  hotel.rooms.map((room, idx) => (
                    <tr key={room.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f3f4f5'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#191c1d', fontFamily: 'Inter, sans-serif' }}>{room.type}</div>
                        <div style={{ fontSize: 11, color: '#717971', fontWeight: 500, marginTop: 3, fontFamily: 'Inter, sans-serif' }}>{MEAL_LABELS[room.meal]}</div>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', fontSize: 12, color: '#414942', fontFamily: 'Inter, sans-serif', fontWeight: 600, background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                        {room.meal}
                      </td>
                      {(['single','double','triple'] as const).map(field => (
                        <td key={field} style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'middle', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
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
                      <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'middle', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                        <input
                          className="editable-cell inv"
                          type="number"
                          defaultValue={room.inventory}
                          min={0}
                          onChange={e => cellChange(idx, 'inventory', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
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
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => saveRow(idx)}
                            className={savedRows.has(idx) ? 'btn-primary' : 'btn-secondary'}
                            style={{
                              padding: '7px 14px', fontSize: 11,
                              background: savedRows.has(idx) ? 'linear-gradient(135deg, #13677b, #18697e)' : undefined,
                              color: savedRows.has(idx) ? '#ffffff' : undefined,
                            }}
                          >
                            {savedRows.has(idx) ? (
                              <>
                                <i className="fi fi-rs-check-circle" style={{ fontSize: 11 }} /> Saved
                              </>
                            ) : (
                              <>
                                <i className="fi fi-rr-disk" style={{ fontSize: 11 }} /> Save
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => deleteRow(idx)}
                            style={{
                              width: 32, height: 32, borderRadius: 9999, border: 'none',
                              background: 'transparent', color: '#717971', cursor: 'pointer',
                              transition: 'all 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ffdad6'; (e.currentTarget as HTMLElement).style.color = '#93000a' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#717971' }}
                            aria-label="Delete row"
                          >
                            <i className="fi fi-rr-trash" style={{ fontSize: 13 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add room form */}
        {showForm && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', letterSpacing: '-0.02em' }}>
                  Add New Room Type
                </div>
                <div style={{ fontSize: 12, color: '#717971', marginTop: 4, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  New room types appear live on the public rates board instantly
                </div>
              </div>
              <button
                onClick={() => { setShowForm(false); setFormError('') }}
                className="btn-ghost"
                style={{ width: 36, height: 36, padding: 0 }}
                aria-label="Close"
              >
                <i className="fi fi-rr-cross-small" style={{ fontSize: 16 }} />
              </button>
            </div>

            <div className="card-elevated" style={{ padding: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr 1fr', gap: 14, alignItems: 'end', marginBottom: 18 }}>
                {[
                  { label: 'Room Type *', field: 'type', type: 'text', placeholder: 'e.g. Deluxe Room' },
                  { label: 'Single ₹', field: 'single', type: 'number', placeholder: '4500' },
                  { label: 'Double ₹ *', field: 'double', type: 'number', placeholder: '6500' },
                  { label: 'Triple ₹', field: 'triple', type: 'number', placeholder: '8000' },
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
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#414942', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Status</label>
                  <select
                    value={newRoom.status}
                    onChange={e => setNewRoom(p => ({ ...p, status: e.target.value as Room['status'] }))}
                    className="input-field"
                    style={{ padding: '11px 14px', fontSize: 13 }}
                  >
                    <option>Available</option>
                    <option>Limited</option>
                    <option>Sold Out</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p style={{ fontSize: 12, color: '#93000a', marginBottom: 14, fontFamily: 'Inter, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
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
      </main>

      <Toast toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </>
  )
}
