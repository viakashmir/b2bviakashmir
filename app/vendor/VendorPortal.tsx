'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  Trash2, Save, Plus, Eye, Clock, BedDouble, TrendingUp,
  Coins, Building2, Contact, CheckCircle2, X as XIcon, Calendar,
} from 'lucide-react'
import BrandedDatePicker from '@/components/BrandedDatePicker'
import Toast, { ToastMessage } from '@/components/Toast'
import OnboardingFlow from './OnboardingFlow'
import {
  Hotel, Room, MealPlan, RoomCategory,
  MEAL_LABELS, STAR_LABELS,
  categoriesFor, amenitiesFor,
  fmtDate, timeAgo, fmtINR, availableInventory, totalInventory,
} from '@/lib/data'
import { browserSupabase } from '@/lib/supabase'

export default function VendorPortal() {
  const { user, isLoaded } = useUser()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [savedRows, setSavedRows] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<'rooms' | 'profile'>('rooms')

  const [newRoom, setNewRoom] = useState({
    type: '', category: 'Deluxe' as RoomCategory, meal: 'CP' as MealPlan,
    double: '', cnb: '', extraBed: '', inventory: '',
    status: 'Available' as Room['status'],
  })
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [profileDraft, setProfileDraft] = useState<Hotel | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/hotels/me', { cache: 'no-store' })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      setHotel(json.hotel)
      if (json.hotel) setProfileDraft(json.hotel)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!isLoaded || !user) return
    refresh()
    let sb: ReturnType<typeof browserSupabase> | null = null
    try { sb = browserSupabase() } catch {}
    if (!sb) return
    const channel = sb.channel('vendor-self')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hotels' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms'  }, refresh)
      .subscribe()
    return () => { sb!.removeChannel(channel) }
  }, [isLoaded, user, refresh])

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') =>
    setToasts(p => [...p, { id: Date.now().toString() + Math.random(), message, type }]), [])

  const saveRow = async (roomId: string, patch: Partial<Room>) => {
    const res = await fetch(`/api/hotels/me/rooms/${roomId}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) { addToast(await res.text(), 'error'); return }
    setSavedRows(p => new Set(p).add(roomId))
    setTimeout(() => setSavedRows(p => { const s = new Set(p); s.delete(roomId); return s }), 2200)
    addToast('Rate saved · Live on public board', 'success')
    refresh()
  }

  const deleteRoom = async (roomId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/hotels/me/rooms/${roomId}`, { method: 'DELETE' })
    if (!res.ok) { addToast(await res.text(), 'error'); return }
    addToast(`"${name}" removed`, 'info')
    refresh()
  }

  const addRoom = async () => {
    setFormError('')
    if (!newRoom.type.trim()) { setFormError('Room type name is required.'); return }
    if (!newRoom.double) { setFormError('Double rate is required.'); return }
    const res = await fetch('/api/hotels/me/rooms', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newRoom),
    })
    if (!res.ok) { setFormError(await res.text()); return }
    setNewRoom({ type: '', category: 'Deluxe', meal: 'CP', double: '', cnb: '', extraBed: '', inventory: '', status: 'Available' })
    setShowForm(false)
    addToast(`"${newRoom.type.trim()}" added · Now live`, 'success')
    refresh()
  }

  const saveProfile = async () => {
    if (!profileDraft) return
    const res = await fetch('/api/hotels/me', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: profileDraft.name, stars: profileDraft.stars,
        location: profileDraft.location, locationLabel: profileDraft.locationLabel,
        propertyType: profileDraft.propertyType,
        address: profileDraft.address, phone: profileDraft.phone, email: profileDraft.email,
        website: profileDraft.website, description: profileDraft.description,
        amenities: profileDraft.amenities,
        tariffStart: profileDraft.tariffStart || null,
        tariffEnd:   profileDraft.tariffEnd   || null,
      }),
    })
    if (!res.ok) { addToast(await res.text(), 'error'); return }
    addToast('Profile saved', 'success')
    refresh()
  }

  const toggleAmenity = (a: string) => {
    if (!profileDraft) return
    const set = new Set(profileDraft.amenities)
    if (set.has(a)) set.delete(a); else set.add(a)
    setProfileDraft({ ...profileDraft, amenities: Array.from(set) })
  }

  const statusClass = (s: string) => s === 'Available' ? 'avail' : s === 'Limited' ? 'limited' : 'sold'

  // -- Loading
  if (!isLoaded || !user || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', opacity: 0.5 }}>Loading…</div>
      </div>
    )
  }

  // -- First-time vendor → onboarding flow
  if (!hotel) {
    return (
      <>
        <OnboardingFlow
          defaultName={user.firstName || user.username || ''}
          defaultEmail={user.primaryEmailAddress?.emailAddress || ''}
          onComplete={refresh}
        />
      </>
    )
  }

  const availInv = availableInventory(hotel.rooms)
  const totalInv = totalInventory(hotel.rooms)
  const avgDbl = hotel.rooms.length ? Math.round(hotel.rooms.reduce((a, r) => a + r.double, 0) / hotel.rooms.length) : 0
  const availTypes = hotel.rooms.filter(r => r.status === 'Available').length
  const soldTypes = hotel.rooms.filter(r => r.status === 'Sold Out').length

  const statCards = [
    { label: 'Rooms Available Today', value: String(availInv), sub: `${availTypes} types open`, Icon: BedDouble, accent: '#13677b' },
    { label: 'Total Inventory', value: String(totalInv), sub: `${soldTypes} sold out`, Icon: TrendingUp, accent: '#00361a' },
    { label: 'Avg Double Rate', value: fmtINR(avgDbl), sub: 'Per night · net B2B', Icon: Coins, accent: '#f09f5e' },
    { label: 'Last Updated', value: timeAgo(hotel.updatedAt), sub: fmtDate(hotel.updatedAt), Icon: Clock, accent: '#00361a', small: true },
  ]

  return (
    <>
      <main>
        <div className="dash-header">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>
              <Building2 size={11} strokeWidth={2.5} /> {STAR_LABELS[hotel.stars]}
            </span>
            <h1 className="dash-title">{hotel.name}</h1>
            <p style={{ fontSize: 14, color: '#414942', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {hotel.locationLabel} · {hotel.phone}
              {!hotel.approved && (
                <span className="badge badge-tertiary" style={{ marginLeft: 12 }}>
                  <Clock size={10} strokeWidth={2.5} /> Pending approval
                </span>
              )}
            </p>
          </div>
          <div className="dash-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#414942', padding: '10px 18px', background: '#ffffff', borderRadius: 9999, fontFamily: 'Inter, sans-serif', boxShadow: '0 1px 3px rgba(25,28,29,0.04)' }}>
              <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#13677b', display: 'inline-block' }} />
              <Clock size={12} strokeWidth={2} style={{ opacity: 0.6 }} />
              {fmtDate(hotel.updatedAt)}
            </div>
            <a href="/vendor/inventory" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
                <BedDouble size={13} strokeWidth={2.3} /> Inventory Calendar
              </button>
            </a>
            <a href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ padding: '10px 18px', fontSize: 13 }}>
                <Eye size={13} strokeWidth={2.2} /> View Live
              </button>
            </a>
          </div>
        </div>

        {/* === MY LISTING — the data the vendor entered during onboarding === */}
        <div className="card-elevated" style={{ overflow: 'hidden', marginBottom: 24 }}>
          <div style={{
            background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)',
            padding: '20px 24px',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', right: 16, top: 16,
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: hotel.approved ? 'rgba(184,240,197,0.18)' : 'rgba(255,220,196,0.22)',
                color: hotel.approved ? '#b8f0c5' : '#ffdcc4',
                fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '5px 12px', borderRadius: 9999,
              }}>
                {hotel.approved
                  ? (<><CheckCircle2 size={11} strokeWidth={2.5} /> Live</>)
                  : (<><Clock size={11} strokeWidth={2.5} /> Pending</>)}
              </span>
            </div>

            <div className="t-overline" style={{ color: '#9dd3aa', marginBottom: 8 }}>
              <Eye size={10} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Your Listing
            </div>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
              {hotel.name}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Building2 size={12} strokeWidth={2.2} /> {STAR_LABELS[hotel.stars]} · {hotel.propertyType === 'houseboat' ? 'Houseboat' : 'Hotel'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <BedDouble size={12} strokeWidth={2.2} /> {hotel.rooms.length} room type{hotel.rooms.length === 1 ? '' : 's'} · {totalInv} rooms total
              </span>
              {hotel.tariffStart && hotel.tariffEnd ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'rgba(255,220,196,0.18)', color: '#ffdcc4',
                  padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                }}>
                  <Calendar size={11} strokeWidth={2.4} />
                  Tariff {hotel.tariffStart.slice(5)} → {hotel.tariffEnd.slice(5)}
                </span>
              ) : (
                <button
                  onClick={() => { setTab('profile'); setTimeout(() => document.getElementById('tariff-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80) }}
                  style={{
                    background: 'rgba(255,220,196,0.18)', color: '#ffdcc4', border: 'none', cursor: 'pointer',
                    padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                    fontFamily: 'Inter, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Calendar size={11} strokeWidth={2.4} />
                  Set tariff period →
                </button>
              )}
            </p>
          </div>

          <div style={{ padding: '18px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            {[
              { label: 'Location', value: hotel.locationLabel },
              { label: 'Address',  value: hotel.address || '—' },
              { label: 'Phone',    value: hotel.phone },
              { label: 'Email',    value: hotel.email },
              ...(hotel.website ? [{ label: 'Website', value: hotel.website }] : []),
            ].map(row => (
              <div key={row.label}>
                <div className="t-overline" style={{ marginBottom: 4 }}>{row.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#191c1d', fontFamily: 'Inter, sans-serif', wordBreak: 'break-word' }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          {hotel.description && (
            <div style={{ padding: '0 24px 16px', fontSize: 13.5, color: '#414942', fontFamily: 'Inter, sans-serif', lineHeight: 1.55 }}>
              {hotel.description}
            </div>
          )}

          {hotel.amenities?.length > 0 && (
            <div style={{ padding: '12px 24px 20px', borderTop: '1px solid #edeeef' }}>
              <div className="t-overline" style={{ marginBottom: 10 }}>Amenities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {hotel.amenities.map(a => (
                  <span key={a} className="badge badge-neutral" style={{ fontSize: 10 }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          {hotel.rooms.length === 0 && (
            <div style={{
              padding: '14px 24px',
              background: '#fff8ed',
              borderTop: '1px solid #ffdcc4',
              fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6f3800',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Clock size={14} strokeWidth={2.3} />
              <strong>Next step:</strong> add room types &amp; rates below — your listing won&apos;t show on the public board without at least one room.
            </div>
          )}
        </div>

        {/* Add Room Type — big standout CTA */}
        <button
          onClick={() => { setTab('rooms'); setShowForm(true); setTimeout(() => document.getElementById('add-room-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80) }}
          style={{
            width: '100%',
            padding: '18px 22px',
            borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg, rgba(255,220,196,0.45), rgba(184,240,197,0.45))',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
            fontFamily: 'Inter, sans-serif',
            marginBottom: 24,
            transition: 'transform 0.18s, box-shadow 0.18s',
            boxShadow: '0 4px 20px rgba(240,159,94,0.18)',
          } as React.CSSProperties}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(240,159,94,0.28)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(240,159,94,0.18)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #00361a, #1a4d2e)',
              color: '#ffdcc4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 6px 14px rgba(0,54,26,0.22)',
            }}>
              <Plus size={22} strokeWidth={2.6} />
            </div>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#00361a', letterSpacing: '-0.01em' }}>
                Add another room category
              </div>
              <div style={{ fontSize: 12, color: '#414942', marginTop: 3, fontWeight: 500 }}>
                Deluxe, Suite, Family… add EP/CP/MAP/AP rates with one form. Goes live the moment you save.
              </div>
            </div>
          </div>
          <div style={{
            padding: '8px 14px', borderRadius: 9999,
            background: '#ffffff', color: '#00361a',
            fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 12,
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
          }}>
            Add now →
          </div>
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #edeeef' }}>
          {([
            { key: 'rooms', label: 'Inventory & Rates', Icon: BedDouble },
            { key: 'profile', label: 'Hotel Profile', Icon: Contact },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '12px 18px', border: 'none', background: 'transparent',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
              color: tab === t.key ? '#00361a' : '#717971', cursor: 'pointer',
              borderBottom: tab === t.key ? '3px solid #00361a' : '3px solid transparent',
              marginBottom: -1, display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <t.Icon size={13} strokeWidth={2.2} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'rooms' && (
          <>
            <div className="stat-grid">
              {statCards.map((c, i) => (
                <div key={i} className="card-elevated" style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div className="t-overline">{c.label}</div>
                    <div style={{ width: 36, height: 36, borderRadius: 9999, background: '#f3f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <c.Icon size={16} strokeWidth={2.2} color={c.accent} />
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
                <Plus size={13} strokeWidth={2.5} /> Add Room Type
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
                        <BedDouble size={28} color="#c1c9bf" style={{ display: 'block', margin: '0 auto 8px' }} />
                        No room types yet. Add your first room type above.
                      </td>
                    </tr>
                  ) : hotel.rooms.map(room => (
                    <RoomRow
                      key={room.id}
                      room={room}
                      propertyType={hotel.propertyType}
                      saved={savedRows.has(room.id)}
                      onSave={patch => saveRow(room.id, patch)}
                      onDelete={() => deleteRoom(room.id, room.type)}
                      statusClass={statusClass}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {showForm && (
              <div id="add-room-form" style={{ marginBottom: 32, scrollMarginTop: 80 }}>
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
                      <select value={newRoom.category} onChange={e => setNewRoom(p => ({ ...p, category: e.target.value as RoomCategory }))} className="input-field" style={{ padding: '11px 14px', fontSize: 13 }}>
                        {categoriesFor(hotel.propertyType).map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#414942', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Meal Plan</label>
                      <select value={newRoom.meal} onChange={e => setNewRoom(p => ({ ...p, meal: e.target.value as MealPlan }))} className="input-field" style={{ padding: '11px 14px', fontSize: 13 }}>
                        <option value="CP">CP — Breakfast</option>
                        <option value="MAP">MAP — B&amp;D</option>
                        <option value="AP">AP — All Meals</option>
                        <option value="EP">EP — No Meals</option>
                      </select>
                    </div>
                  </div>
                  {formError && (
                    <p style={{ fontSize: 12, color: '#93000a', margin: '4px 0 12px', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                      <XIcon size={13} strokeWidth={2.5} style={{ marginRight: 6, verticalAlign: 'middle' }} /> {formError}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={addRoom} className="btn-primary" style={{ padding: '12px 24px', fontSize: 13 }}>
                      <Plus size={13} strokeWidth={2.5} /> Add Room Type
                    </button>
                    <button onClick={() => { setShowForm(false); setFormError('') }} className="btn-secondary" style={{ padding: '12px 22px', fontSize: 13 }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'profile' && profileDraft && (
          <div className="card-elevated" style={{ padding: 28, marginBottom: 32 }}>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', marginBottom: 6 }}>Hotel Profile</div>
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
                      value={((profileDraft as unknown) as Record<string, unknown>)[f.key] as string || ''}
                      onChange={e => setProfileDraft({ ...profileDraft, [f.key]: e.target.value })}
                      className="input-field" rows={3}
                      style={{ padding: '11px 14px', fontSize: 13, resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={((profileDraft as unknown) as Record<string, unknown>)[f.key] as string || ''}
                      onChange={e => setProfileDraft({ ...profileDraft, [f.key]: e.target.value })}
                      className="input-field"
                      style={{ padding: '11px 14px', fontSize: 13 }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Tariff window */}
            <div id="tariff-block" style={{ scrollMarginTop: 80, marginTop: 28, padding: 18, borderRadius: 14, background: 'linear-gradient(135deg, rgba(255,220,196,0.32), rgba(184,240,197,0.28))', border: '1px solid rgba(240,159,94,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Calendar size={14} strokeWidth={2.5} color="#6f3800" />
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6f3800', fontFamily: 'Inter, sans-serif' }}>Tariff valid period</label>
              </div>
              <p style={{ fontSize: 12.5, color: '#414942', margin: '0 0 14px', fontFamily: 'Inter, sans-serif', lineHeight: 1.55 }}>
                The window these rates apply for. Shown on the public card as <strong>Tariff Mar 26 → Jun 26</strong>. Update each season.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <BrandedDatePicker
                  label="Valid from"
                  value={profileDraft.tariffStart || ''}
                  max={profileDraft.tariffEnd || undefined}
                  onChange={v => setProfileDraft({ ...profileDraft, tariffStart: v })}
                  placeholder="Pick start date"
                />
                <BrandedDatePicker
                  label="Valid till"
                  value={profileDraft.tariffEnd || ''}
                  min={profileDraft.tariffStart || undefined}
                  onChange={v => setProfileDraft({ ...profileDraft, tariffEnd: v })}
                  placeholder="Pick end date"
                />
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#414942', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}>Amenities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {amenitiesFor(hotel.propertyType).map(a => {
                  const active = profileDraft.amenities.includes(a)
                  return (
                    <button key={a} onClick={() => toggleAmenity(a)} style={{
                      padding: '8px 14px', borderRadius: 9999, border: 'none',
                      background: active ? 'linear-gradient(135deg, #00361a, #1a4d2e)' : '#f3f4f5',
                      color: active ? '#ffffff' : '#414942',
                      fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                      {active ? <CheckCircle2 size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2.5} />}
                      {a}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button onClick={saveProfile} className="btn-primary" style={{ padding: '12px 24px', fontSize: 13 }}>
                <Save size={13} strokeWidth={2.3} /> Save Profile
              </button>
            </div>
          </div>
        )}
      </main>
      <Toast toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </>
  )
}

function RoomRow({ room, propertyType, saved, onSave, onDelete, statusClass }: {
  room: Room
  propertyType: Hotel['propertyType']
  saved: boolean
  onSave: (patch: Partial<Room>) => void
  onDelete: () => void
  statusClass: (s: string) => string
}) {
  const [draft, setDraft] = useState<Partial<Room>>({})
  const merged = { ...room, ...draft }
  const change = (k: keyof Room, v: string | number) => setDraft(d => ({ ...d, [k]: v }))

  return (
    <tr style={{ transition: 'background 0.15s' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f3f4f5'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
        <input value={merged.type} onChange={e => change('type', e.target.value)} className="editable-cell" style={{ textAlign: 'left', width: 140 }} />
        <div style={{ fontSize: 11, color: '#717971', fontWeight: 500, marginTop: 3, fontFamily: 'Inter, sans-serif' }}>{MEAL_LABELS[merged.meal]}</div>
      </td>
      <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
        <select className="input-field" value={merged.category} onChange={e => change('category', e.target.value)} style={{ padding: '6px 10px', fontSize: 12, width: 'auto' }}>
          {categoriesFor(propertyType).map(c => <option key={c}>{c}</option>)}
        </select>
      </td>
      <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
        <select className="input-field" value={merged.meal} onChange={e => change('meal', e.target.value)} style={{ padding: '6px 10px', fontSize: 12, width: 'auto' }}>
          <option value="CP">CP</option><option value="MAP">MAP</option><option value="AP">AP</option><option value="EP">EP</option>
        </select>
      </td>
      {(['double','cnb','extraBed'] as const).map(field => (
        <td key={field} style={{ padding: '14px 16px', textAlign: 'right', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
          <input className="editable-cell" type="number" value={(merged as Record<string, unknown>)[field] as number} min={0} onChange={e => change(field, parseInt(e.target.value) || 0)} />
        </td>
      ))}
      <td style={{ padding: '14px 16px', textAlign: 'right', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
        <input className="editable-cell inv" type="number" value={merged.inventory} min={0} onChange={e => change('inventory', parseInt(e.target.value) || 0)} />
      </td>
      <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
        <select className={`status-select ${statusClass(merged.status)}`} value={merged.status} onChange={e => change('status', e.target.value)}>
          <option>Available</option><option>Limited</option><option>Sold Out</option>
        </select>
      </td>
      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => { onSave(draft); setDraft({}) }}
            className={saved ? 'btn-primary' : 'btn-primary'}
            style={{
              padding: '8px 14px', fontSize: 11.5,
              background: saved ? 'linear-gradient(135deg, #13677b, #18697e)' : undefined,
              boxShadow: saved ? '0 4px 12px rgba(19,103,123,0.25)' : '0 4px 12px rgba(0,54,26,0.22)',
            }}
          >
            {saved
              ? (<><CheckCircle2 size={12} strokeWidth={2.5} /> Saved</>)
              : (<><Save size={12} strokeWidth={2.3} /> Save</>)}
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: '8px 12px', borderRadius: 9999, border: 'none',
              background: '#ba1a1a', color: '#ffffff',
              fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 800,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
              transition: 'all 0.18s', boxShadow: '0 4px 12px rgba(186,26,26,0.25)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#93000a' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ba1a1a' }}
            aria-label="Delete row"
          >
            <Trash2 size={12} strokeWidth={2.3} /> Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
