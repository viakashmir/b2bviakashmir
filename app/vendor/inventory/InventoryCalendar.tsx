'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Trash2, X as XIcon, Calendar,
  BedDouble, Lock,
} from 'lucide-react'
import Toast, { ToastMessage } from '@/components/Toast'
import { browserSupabase } from '@/lib/supabase'

type Day = {
  date: string; day: number; status: 'available' | 'partial' | 'full' | 'past'
  inTariff?: boolean
  totalRooms: number; totalBlocked: number; totalAvailable: number
  rooms: Array<{ id: string; type: string; total: number; blocked: number; available: number }>
  blocks: Array<{ id: string; type: string; reason: string; count: number; roomId: string | null; otaName: string | null }>
}
type CalendarData = {
  year: number
  month: number
  tariffStart?: string | null
  tariffEnd?: string | null
  rooms: Array<{ id: string; type: string; category: string; inventory: number }>
  days: Day[]
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function todayStr() { return toInputDate(new Date()) }
function fmtDateLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function statusBg(s: Day['status']) {
  switch (s) {
    case 'available': return { bg: '#e7f7ec', dot: '#1d5031' }
    case 'partial':   return { bg: '#fff3cd', dot: '#6f3800' }
    case 'full':      return { bg: '#ffdad6', dot: '#93000a' }
    case 'past':      return { bg: '#edeeef', dot: '#717971' }
  }
}

export default function InventoryCalendar() {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [selected, setSelected] = useState<Day | null>(null)

  // Block form
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    startDate: todayStr(),
    endDate: todayStr(),
    roomId: '',
    count: 1,
    reason: '',
    otaName: '',
    source: 'manual' as 'manual' | 'ota',
  })

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/vendor/inventory/calendar?year=${year}&month=${month}`, { cache: 'no-store' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        addToast(j.error || 'Failed to load calendar', 'error')
        return
      }
      setData(await res.json())
    } finally { setLoading(false) }
  }, [year, month])

  useEffect(() => {
    refresh()
    let sb: ReturnType<typeof browserSupabase> | null = null
    try { sb = browserSupabase() } catch {}
    if (!sb) return
    const channel = sb.channel('vendor-inventory')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_blocks' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, refresh)
      .subscribe()
    return () => { sb!.removeChannel(channel) }
  }, [refresh])

  const addToast = (msg: string, type: ToastMessage['type'] = 'info') =>
    setToasts(p => [...p, { id: Date.now().toString() + Math.random(), message: msg, type }])

  const prev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const next = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const submitBlock = async () => {
    if (form.endDate < form.startDate) { addToast('End date is before start date', 'error'); return }
    const res = await fetch('/api/vendor/inventory/blocks', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        startDate: form.startDate,
        endDate: form.endDate,
        roomId: form.roomId || undefined,
        count: form.count,
        reason: form.source === 'ota' ? `${form.otaName || 'OTA'} booking` : (form.reason || 'Manual block'),
        otaName: form.source === 'ota' ? form.otaName || undefined : undefined,
      }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      addToast(j.error || 'Failed to block', 'error'); return
    }
    setShowForm(false)
    setForm(f => ({ ...f, reason: '', otaName: '', count: 1 }))
    addToast('Inventory blocked', 'success')
    refresh()
  }

  const removeBlock = async (id: string) => {
    if (!confirm('Remove this block?')) return
    const res = await fetch(`/api/vendor/inventory/blocks/${id}`, { method: 'DELETE' })
    if (!res.ok) { addToast('Failed to remove block', 'error'); return }
    addToast('Block removed', 'info')
    refresh()
  }

  // Calendar grid layout — pad leading days from previous month
  const firstWeekday = new Date(year, month - 1, 1).getDay() // 0 Sun .. 6 Sat
  const pad = (firstWeekday + 6) % 7 // shift so Monday = 0
  const totalCells = pad + (data?.days.length ?? 0)
  const trailing = (7 - (totalCells % 7)) % 7

  if (loading) {
    return (
      <>
        <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', opacity: 0.5 }}>Loading calendar…</div>
        </div>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <main>
          <div className="card-elevated" style={{ padding: 28 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#414942' }}>
              Couldn&apos;t load the calendar. Try refreshing the page.
            </p>
          </div>
        </main>
      </>
    )
  }

  const totalRoomsToday = data.rooms.reduce((s, r) => s + r.inventory, 0)
  const todayDay = data.days.find(d => d.date === todayStr())
  const availableToday = todayDay?.totalAvailable ?? totalRoomsToday

  // No rooms yet → clear empty state pointing to where to add them
  if (data.rooms.length === 0) {
    return (
      <>
        <main>
          <div className="dash-header">
            <div>
              <span className="badge badge-primary" style={{ marginBottom: 12 }}>
                <Calendar size={11} strokeWidth={2.5} /> Inventory Calendar
              </span>
              <h1 className="dash-title">Inventory & Availability</h1>
            </div>
          </div>
          <div className="card-elevated" style={{ padding: 48, textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
            <BedDouble size={48} color="#c1c9bf" style={{ display: 'block', margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#00361a', margin: '0 0 10px' }}>
              No rooms in your listing yet
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#414942', lineHeight: 1.55, margin: '0 0 24px' }}>
              Add at least one room type with rates from your dashboard, then come back here to block dates for OTA bookings, holds, or maintenance.
            </p>
            <a href="/vendor" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '12px 22px', fontSize: 13 }}>
                <BedDouble size={13} strokeWidth={2.3} /> Add Room Types
              </button>
            </a>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <main>
        <div className="dash-header">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>
              <Calendar size={11} strokeWidth={2.5} /> Inventory Calendar
            </span>
            <h1 className="dash-title">Inventory & Availability</h1>
            <p style={{ fontSize: 14, color: '#414942', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Block dates for OTA bookings, maintenance, or holds. Public board availability updates live.
            </p>
          </div>
          <div className="dash-actions">
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
              <Plus size={13} strokeWidth={2.5} /> Block Dates
            </button>
            <a href="/vendor" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ padding: '10px 18px', fontSize: 13 }}>
                <BedDouble size={13} strokeWidth={2.2} /> Rates & Rooms
              </button>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Available Today', value: String(availableToday), sub: `${data.rooms.length} room types`, accent: '#13677b' },
            { label: 'Total Inventory', value: String(totalRoomsToday), sub: 'Rooms in your hotel', accent: '#00361a' },
            { label: 'Blocked Today', value: String((totalRoomsToday - availableToday)), sub: 'OTA / Manual / Hold', accent: '#f09f5e' },
            { label: 'Month', value: `${MONTH_NAMES[month - 1].slice(0, 3)} ${year}`, sub: 'Calendar view', accent: '#00361a', small: true },
          ].map((c, i) => (
            <div key={i} className="card-elevated" style={{ padding: '22px 24px' }}>
              <div className="t-overline" style={{ marginBottom: 8 }}>{c.label}</div>
              <div className={`stat-value${c.small ? ' small' : ''}`} style={{ color: c.accent }}>{c.value}</div>
              <div style={{ fontSize: 12, color: '#717971', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Tariff strip */}
        {data.tariffStart && data.tariffEnd && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, flexWrap: 'wrap', marginBottom: 12,
            padding: '12px 18px', borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(255,220,196,0.4), rgba(184,240,197,0.4))',
            border: '1px solid rgba(240,159,94,0.35)',
            fontFamily: 'Inter, sans-serif',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: 9999, background: '#f09f5e', boxShadow: '0 0 0 4px rgba(240,159,94,0.18)' }} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6f3800' }}>Current tariff window</div>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#00361a', marginTop: 2 }}>
                  {fmtDateLabel(data.tariffStart)} → {fmtDateLabel(data.tariffEnd)}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#414942', fontWeight: 600 }}>
              Highlighted days show when your published prices apply.
            </div>
          </div>
        )}

        {/* Month nav */}
        <div className="card-elevated" style={{ padding: 18, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#00361a', letterSpacing: '-0.02em' }}>
            {MONTH_NAMES[month - 1]} {year}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={prev} className="btn-secondary" style={{ padding: '8px 12px', fontSize: 12 }}>
              <ChevronLeft size={14} strokeWidth={2.3} /> Prev
            </button>
            <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1) }} className="btn-secondary" style={{ padding: '8px 14px', fontSize: 12 }}>
              Today
            </button>
            <button onClick={next} className="btn-secondary" style={{ padding: '8px 12px', fontSize: 12 }}>
              Next <ChevronRight size={14} strokeWidth={2.3} />
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="card-elevated" style={{ padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {WEEKDAYS.map(d => (
              <div key={d} style={{
                fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: '#717971',
                padding: '6px 8px', textAlign: 'center',
              }}>{d}</div>
            ))}
            {Array.from({ length: pad }).map((_, i) => <div key={`pad-${i}`} />)}
            {data.days.map(d => {
              const s = statusBg(d.status)
              const isToday = d.date === todayStr()
              const isSelected = selected?.date === d.date
              return (
                <button
                  key={d.date}
                  onClick={() => setSelected(isSelected ? null : d)}
                  style={{
                    position: 'relative',
                    background: d.inTariff && d.status === 'available'
                      ? 'linear-gradient(135deg, rgba(255,220,196,0.55), rgba(184,240,197,0.45))'
                      : s.bg,
                    border:
                      isSelected ? '2px solid #00361a'
                      : isToday ? '2px solid #13677b'
                      : d.inTariff ? '2px solid #ffb780'
                      : '1px solid transparent',
                    borderRadius: 10, padding: '8px 6px',
                    minHeight: 64, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                    fontFamily: 'Inter, sans-serif',
                    opacity: d.status === 'past' ? 0.55 : 1,
                    transition: 'transform 0.12s',
                  }}
                  onMouseEnter={e => { if (d.status !== 'past') (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                >
                  {d.inTariff && (
                    <span title="In tariff window" style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 8, height: 8, borderRadius: 9999,
                      background: '#f09f5e',
                      boxShadow: '0 0 0 3px rgba(240,159,94,0.18)',
                    }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: '#191c1d' }}>{d.day}</span>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, marginLeft: 'auto' }} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#414942' }}>
                    {d.totalAvailable}/{d.totalRooms}
                  </div>
                  {d.totalBlocked > 0 && (
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#6f3800', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Lock size={9} strokeWidth={2.5} /> {d.totalBlocked}
                    </div>
                  )}
                </button>
              )
            })}
            {Array.from({ length: trailing }).map((_, i) => <div key={`trail-${i}`} />)}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 11, color: '#414942', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            {([
              ['available', 'All rooms open'],
              ['partial', 'Partially blocked'],
              ['full', 'Fully booked / blocked'],
              ['past', 'Past date'],
            ] as Array<[Day['status'], string]>).map(([s, label]) => (
              <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 4, background: statusBg(s).bg, border: `1px solid ${statusBg(s).dot}` }} />
                {label}
              </span>
            ))}
            {data.tariffStart && data.tariffEnd && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 4, background: 'linear-gradient(135deg, rgba(255,220,196,0.55), rgba(184,240,197,0.45))', border: '2px solid #ffb780' }} />
                Tariff window
              </span>
            )}
          </div>
        </div>

        {/* Selected day details */}
        {selected && (
          <div className="card-elevated" style={{ padding: 24, marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div className="t-overline" style={{ marginBottom: 4 }}>Selected day</div>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#00361a', margin: 0 }}>
                  {new Date(selected.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
                <p style={{ fontSize: 13, color: '#717971', margin: '4px 0 0', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  {selected.totalAvailable} of {selected.totalRooms} rooms available · {selected.totalBlocked} blocked
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-secondary" style={{ width: 36, height: 36, padding: 0, borderRadius: 9999 }}>
                <XIcon size={14} strokeWidth={2.3} />
              </button>
            </div>

            {/* Per-room breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
              {selected.rooms.map(r => (
                <div key={r.id} style={{ background: '#f3f4f5', padding: 12, borderRadius: 10, fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#191c1d' }}>{r.type}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                    <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: r.available === 0 ? '#93000a' : r.available <= 2 ? '#6f3800' : '#1d5031' }}>
                      {r.available}
                    </span>
                    <span style={{ fontSize: 11, color: '#717971', fontWeight: 600 }}>/ {r.total} available</span>
                  </div>
                  {r.blocked > 0 && (
                    <div style={{ fontSize: 11, color: '#6f3800', marginTop: 4, fontWeight: 600 }}>
                      {r.blocked} blocked today
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Blocks active today */}
            {selected.blocks.length > 0 && (
              <div>
                <div className="t-overline" style={{ marginBottom: 8 }}>Active blocks</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selected.blocks.map(b => (
                    <div key={b.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 14px', background: '#f8f9fa', borderRadius: 10,
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#191c1d' }}>{b.reason}</div>
                        <div style={{ fontSize: 11, color: '#717971', marginTop: 3 }}>
                          {b.count} room{b.count > 1 ? 's' : ''}
                          {b.otaName ? ` · ${b.otaName}` : ''}
                          {b.roomId ? ` · room-specific` : ' · all rooms'}
                        </div>
                      </div>
                      <button
                        onClick={() => removeBlock(b.id)}
                        style={{
                          padding: '7px 12px', borderRadius: 9999, border: 'none',
                          background: '#ba1a1a', color: '#ffffff',
                          fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 800,
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                        }}
                      >
                        <Trash2 size={11} strokeWidth={2.3} /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Block-dates modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,54,26,0.55)', zIndex: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            backdropFilter: 'blur(6px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
        >
          <div className="card-elevated" style={{ width: '100%', maxWidth: 480, padding: 28, animation: 'fade-up 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div className="t-overline" style={{ marginBottom: 4 }}>Block inventory</div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#00361a', margin: 0 }}>
                  Block date range
                </h3>
              </div>
              <button onClick={() => setShowForm(false)} className="btn-secondary" style={{ width: 36, height: 36, padding: 0, borderRadius: 9999 }}>
                <XIcon size={14} strokeWidth={2.3} />
              </button>
            </div>

            {/* Quick presets */}
            <div style={{ marginBottom: 14 }}>
              <div className="t-overline" style={{ marginBottom: 8 }}>Quick presets</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {([
                  { label: 'Today',           days: 1 },
                  { label: 'Next 3 days',     days: 3 },
                  { label: 'This weekend',    days: 0, weekend: true },
                  { label: 'Next 7 days',     days: 7 },
                  { label: 'Next 14 days',    days: 14 },
                  { label: 'Next 30 days',    days: 30 },
                ]).map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      const today = new Date()
                      const start = new Date(today)
                      const end = new Date(today)
                      if (p.weekend) {
                        // Friday → Sunday
                        const day = today.getDay() // 0 Sun..6 Sat
                        const toFriday = (5 - day + 7) % 7 || 0
                        start.setDate(today.getDate() + toFriday)
                        end.setDate(start.getDate() + 2)
                      } else {
                        end.setDate(today.getDate() + p.days - 1)
                      }
                      setForm(f => ({ ...f, startDate: toInputDate(start), endDate: toInputDate(end) }))
                    }}
                    style={{
                      padding: '7px 13px', borderRadius: 9999,
                      border: '1px solid rgba(0,54,26,0.12)', background: '#ffffff',
                      color: '#1a4d2e', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 700,
                      transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f3f4f5'; (e.currentTarget as HTMLElement).style.borderColor = '#00361a' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,54,26,0.12)' }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live duration badge */}
            {form.startDate && form.endDate && form.endDate >= form.startDate && (() => {
              const s = new Date(form.startDate), e = new Date(form.endDate)
              const nights = Math.round((e.getTime() - s.getTime()) / 86400000) + 1
              return (
                <div style={{
                  marginBottom: 12, padding: '10px 14px', borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(184,240,197,0.35), rgba(255,220,196,0.3))',
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#00361a',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span>
                    Blocking <strong>{form.count} × {nights}</strong> = {form.count * nights} room-nights
                  </span>
                  <span style={{ fontSize: 11, color: '#414942', fontWeight: 600 }}>
                    {fmtDateLabel(form.startDate)} → {fmtDateLabel(form.endDate)}
                  </span>
                </div>
              )
            })()}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="t-overline" style={{ display: 'block', marginBottom: 6 }}>Start date</label>
                <input type="date" min={todayStr()} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" style={{ padding: '10px 12px', fontSize: 13 }} />
              </div>
              <div>
                <label className="t-overline" style={{ display: 'block', marginBottom: 6 }}>End date</label>
                <input type="date" min={form.startDate || todayStr()} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field" style={{ padding: '10px 12px', fontSize: 13 }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="t-overline" style={{ display: 'block', marginBottom: 6 }}>Room type (optional — leave blank for all)</label>
                <select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))} className="input-field" style={{ padding: '10px 12px', fontSize: 13 }}>
                  <option value="">All room types</option>
                  {data.rooms.map(r => <option key={r.id} value={r.id}>{r.type} ({r.inventory} rooms)</option>)}
                </select>
              </div>
              <div>
                <label className="t-overline" style={{ display: 'block', marginBottom: 6 }}>Rooms to block</label>
                <input type="number" min={1} value={form.count} onChange={e => setForm(f => ({ ...f, count: parseInt(e.target.value) || 1 }))} className="input-field" style={{ padding: '10px 12px', fontSize: 13 }} />
              </div>
              <div>
                <label className="t-overline" style={{ display: 'block', marginBottom: 6 }}>Source</label>
                <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value as 'manual' | 'ota' }))} className="input-field" style={{ padding: '10px 12px', fontSize: 13 }}>
                  <option value="manual">Manual / Maintenance</option>
                  <option value="ota">OTA Booking</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                {form.source === 'ota' ? (
                  <>
                    <label className="t-overline" style={{ display: 'block', marginBottom: 6 }}>OTA name</label>
                    <select value={form.otaName} onChange={e => setForm(f => ({ ...f, otaName: e.target.value }))} className="input-field" style={{ padding: '10px 12px', fontSize: 13 }}>
                      <option value="">— Select OTA —</option>
                      {['Booking.com', 'MakeMyTrip', 'Goibibo', 'Airbnb', 'Agoda', 'Expedia', 'EaseMyTrip', 'Yatra', 'Other'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <label className="t-overline" style={{ display: 'block', marginBottom: 6 }}>Reason (optional)</label>
                    <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Maintenance, owner stay" className="input-field" style={{ padding: '10px 12px', fontSize: 13 }} />
                  </>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button onClick={submitBlock} className="btn-primary" style={{ padding: '12px 22px', fontSize: 13 }}>
                <Lock size={13} strokeWidth={2.5} /> Block Inventory
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: '12px 22px', fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </>
  )
}
