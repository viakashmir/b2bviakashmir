'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import Header from '@/components/Header'
import HotelCard from '@/components/HotelCard'
import Toast, { ToastMessage } from '@/components/Toast'
import {
  Concern, ConcernCategory, ConcernStatus, CONCERN_CATEGORIES, Hotel,
  rowToHotel, timeAgo,
} from '@/lib/data'
import { browserSupabase } from '@/lib/supabase'

const STATUS_BADGE: Record<ConcernStatus, string> = {
  open: 'badge-error', 'in-progress': 'badge-tertiary',
  resolved: 'badge-success', closed: 'badge-neutral',
}

type Tab = 'rates' | 'raise' | 'mine'

export default function CustomerPortal() {
  const { user, isLoaded } = useUser()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [myConcerns, setMyConcerns] = useState<Concern[]>([])
  const [tab, setTab] = useState<Tab>('rates')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    hotelId: '',
    category: 'Rate Discrepancy' as ConcernCategory,
    priority: 'medium' as 'low' | 'medium' | 'high',
    subject: '',
    description: '',
    company: '',
  })
  const [formError, setFormError] = useState('')

  const refresh = useCallback(async () => {
    try {
      // Hotels: read direct from Supabase via anon key (RLS allows approved=true)
      let sb: ReturnType<typeof browserSupabase> | null = null
      try { sb = browserSupabase() } catch {}
      if (sb) {
        const [{ data: hRows }, { data: rRows }] = await Promise.all([
          sb.from('hotels').select('*').eq('approved', true).order('created_at', { ascending: false }),
          sb.from('rooms').select('*'),
        ])
        setHotels((hRows ?? []).map((h: any) => rowToHotel(h, rRows ?? [])))
      }
      const cRes = await fetch('/api/concerns', { cache: 'no-store' })
      if (cRes.ok) { const j = await cRes.json(); setMyConcerns(j.concerns ?? []) }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    refresh()
    let sb: ReturnType<typeof browserSupabase> | null = null
    try { sb = browserSupabase() } catch {}
    if (!sb) return
    const channel = sb.channel('customer-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hotels' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms'  }, refresh)
      .subscribe()
    return () => { sb!.removeChannel(channel) }
  }, [refresh])

  const addToast = useCallback((msg: string, type: ToastMessage['type'] = 'info') =>
    setToasts(p => [...p, { id: Date.now().toString() + Math.random(), message: msg, type }]), [])

  if (!isLoaded || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', opacity: 0.5 }}>Loading…</div>
      </div>
    )
  }

  const agentName = user?.fullName || user?.firstName || user?.username || 'Travel Agent'
  const filteredHotels = hotels.filter(h => {
    const s = search.toLowerCase().trim()
    return !s || h.name.toLowerCase().includes(s) || h.locationLabel.toLowerCase().includes(s)
  })

  const submitConcern = async () => {
    setFormError('')
    if (!form.hotelId) return setFormError('Please pick the hotel this concern is about.')
    if (!form.subject.trim()) return setFormError('Subject is required.')
    if (!form.description.trim()) return setFormError('Description is required.')
    const hotel = hotels.find(h => h.id === form.hotelId)
    if (!hotel) return setFormError('Hotel not found.')

    const res = await fetch('/api/concerns', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        hotelId: form.hotelId,
        hotelName: hotel.name,
        category: form.category,
        priority: form.priority,
        subject: form.subject.trim(),
        description: form.description.trim(),
        company: form.company.trim() || '-',
      }),
    })
    if (!res.ok) { setFormError(await res.text()); return }
    setForm(f => ({ ...f, hotelId: '', subject: '', description: '' }))
    setTab('mine')
    addToast('Concern submitted · Admin will respond shortly', 'success')
    refresh()
  }

  const openCount = myConcerns.filter(c => c.status === 'open' || c.status === 'in-progress').length

  const TABS: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: 'rates', label: 'Browse Rates', icon: 'fi-rr-eye' },
    { key: 'raise', label: 'Raise a Concern', icon: 'fi-rr-comment-alt-edit' },
    { key: 'mine', label: 'My Concerns', icon: 'fi-rr-comment-alt-middle', badge: openCount || undefined },
  ]

  return (
    <>
      <Header />
      <main className="app-shell">
        <div className="dash-header">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>
              <i className="fi fi-rr-user" style={{ fontSize: 11 }} /> Travel Agent
            </span>
            <h1 className="dash-title">Welcome, {agentName.split(' ')[0]}</h1>
            <p style={{ fontSize: 14, color: '#414942', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Browse live B2B rates and raise concerns when something doesn&apos;t add up.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #edeeef', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '12px 18px', border: 'none', background: 'transparent',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
              color: tab === t.key ? '#00361a' : '#717971', cursor: 'pointer',
              borderBottom: tab === t.key ? '3px solid #00361a' : '3px solid transparent',
              marginBottom: -1, display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <i className={`fi ${t.icon}`} style={{ fontSize: 13 }} />
              {t.label}
              {t.badge ? <span className="badge badge-error" style={{ padding: '2px 8px', fontSize: 9 }}>{t.badge}</span> : null}
            </button>
          ))}
        </div>

        {tab === 'rates' && (
          <>
            <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
              <i className="fi fi-rr-search" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#717971', pointerEvents: 'none', zIndex: 1 }} />
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hotel or location…" className="input-field" style={{ padding: '12px 14px 12px 42px', fontSize: 13 }} />
            </div>
            {filteredHotels.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                <i className="fi fi-rr-search" style={{ fontSize: 36, color: '#c1c9bf', display: 'block', marginBottom: 10 }} />
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 700, color: '#414942' }}>No hotels available</p>
              </div>
            ) : (
              <div className="hotel-grid">
                {filteredHotels.map((h, i) => <HotelCard key={h.id} hotel={h} index={i} />)}
              </div>
            )}
          </>
        )}

        {tab === 'raise' && (
          <div className="card-elevated" style={{ padding: 28, maxWidth: 720 }}>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', marginBottom: 6 }}>Raise a Concern</div>
            <p style={{ fontSize: 13, color: '#717971', margin: '0 0 24px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Tell our team what went wrong. Admin will reach out and update the status.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="t-overline" style={{ display: 'block', marginBottom: 8 }}>Hotel</label>
                <select value={form.hotelId} onChange={e => setForm(p => ({ ...p, hotelId: e.target.value }))} className="input-field" style={{ padding: '12px 14px', fontSize: 13 }}>
                  <option value="">- Select a hotel -</option>
                  {hotels.map(h => <option key={h.id} value={h.id}>{h.name}, {h.locationLabel}</option>)}
                </select>
              </div>
              <div>
                <label className="t-overline" style={{ display: 'block', marginBottom: 8 }}>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as ConcernCategory }))} className="input-field" style={{ padding: '12px 14px', fontSize: 13 }}>
                  {CONCERN_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="t-overline" style={{ display: 'block', marginBottom: 8 }}>Priority</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as 'low' | 'medium' | 'high' }))} className="input-field" style={{ padding: '12px 14px', fontSize: 13 }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="t-overline" style={{ display: 'block', marginBottom: 8 }}>Your Company</label>
                <input type="text" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Travel agency name" className="input-field" style={{ padding: '12px 14px', fontSize: 13 }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="t-overline" style={{ display: 'block', marginBottom: 8 }}>Subject</label>
                <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Short summary of the issue" className="input-field" style={{ padding: '12px 14px', fontSize: 13 }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="t-overline" style={{ display: 'block', marginBottom: 8 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={5} placeholder="What happened? Dates, traveller names, what the portal showed vs. reality." className="input-field" style={{ padding: '12px 14px', fontSize: 13, resize: 'vertical' }} />
              </div>
            </div>

            {formError && (
              <p style={{ fontSize: 12, color: '#93000a', margin: '14px 0', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                <i className="fi fi-rs-exclamation" style={{ fontSize: 13, marginRight: 6 }} /> {formError}
              </p>
            )}

            <div style={{ marginTop: 20 }}>
              <button onClick={submitConcern} className="btn-primary" style={{ padding: '12px 24px', fontSize: 13 }}>
                <i className="fi fi-rr-paper-plane" style={{ fontSize: 13 }} /> Submit Concern
              </button>
            </div>
          </div>
        )}

        {tab === 'mine' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {myConcerns.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                <i className="fi fi-rr-comment-alt-middle" style={{ fontSize: 40, color: '#c1c9bf', marginBottom: 12, display: 'block' }} />
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#414942', marginBottom: 4 }}>No concerns yet</p>
                <p style={{ fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#717971' }}>When you raise one, it will appear here with admin responses.</p>
              </div>
            ) : myConcerns.map(c => (
              <div key={c.id} className="card-elevated" style={{ padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status.replace('-', ' ')}</span>
                  <span className="badge badge-neutral">{c.category}</span>
                </div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#00361a', margin: 0 }}>{c.subject}</h3>
                <div style={{ fontSize: 12, color: '#717971', marginTop: 4, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  <strong style={{ color: '#414942' }}>{c.hotelName}</strong> · {timeAgo(c.createdAt)}
                </div>
                <p style={{ fontSize: 13.5, color: '#414942', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: '12px 0 14px' }}>{c.description}</p>
                {c.adminResponse && (
                  <div className="card-section" style={{ padding: 14 }}>
                    <div className="t-overline" style={{ marginBottom: 6 }}>Admin response · {timeAgo(c.adminResponseAt)}</div>
                    <div style={{ fontSize: 13, color: '#191c1d', fontFamily: 'Inter, sans-serif', lineHeight: 1.55 }}>{c.adminResponse}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Toast toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </>
  )
}
