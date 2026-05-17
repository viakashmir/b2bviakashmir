'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import {
  ShieldCheck, RefreshCw, Building2, Clock, MessageSquare, TrendingUp,
  Trash2, Pause, CheckCircle2, AlertTriangle, Send, BarChart3, LayoutDashboard,
  ChevronDown, ChevronUp, MessageCircle, Phone, Mail, MapPin, BedDouble,
} from 'lucide-react'
import Header from '@/components/Header'
import Toast, { ToastMessage } from '@/components/Toast'
import {
  Concern, ConcernStatus, Enquiry, Hotel, STAR_LABELS, GST_LABELS,
  timeAgo, totalInventory, availableInventory, fmtINR,
} from '@/lib/data'
import { browserSupabase } from '@/lib/supabase'

type Tab = 'overview' | 'hotels' | 'enquiries' | 'concerns'

const STATUS_BADGE: Record<ConcernStatus, string> = {
  open: 'badge-error', 'in-progress': 'badge-tertiary',
  resolved: 'badge-success', closed: 'badge-neutral',
}
const PRIORITY_BADGE: Record<'low' | 'medium' | 'high', string> = {
  low: 'badge-neutral', medium: 'badge-secondary', high: 'badge-error',
}

export default function AdminPortal() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [concerns, setConcerns] = useState<Concern[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [replyId, setReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [expandedHotelId, setExpandedHotelId] = useState<string | null>(null)

  const [authError, setAuthError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [hRes, cRes, eRes] = await Promise.all([
        fetch('/api/admin/hotels', { cache: 'no-store' }),
        fetch('/api/concerns', { cache: 'no-store' }),
        fetch('/api/enquiries', { cache: 'no-store' }),
      ])
      if (hRes.status === 401 || hRes.status === 403) {
        setAuthError('Your Clerk user is missing publicMetadata.role = "admin". Open Clerk Dashboard → Users → your user → Metadata → Public, set the role, and reload.')
      } else if (hRes.ok) { const j = await hRes.json(); setHotels(j.hotels ?? []); setAuthError(null) }
      if (cRes.ok) { const j = await cRes.json(); setConcerns(j.concerns ?? []) }
      if (eRes.ok) { const j = await eRes.json(); setEnquiries(j.enquiries ?? []) }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    refresh()
    let sb: ReturnType<typeof browserSupabase> | null = null
    try { sb = browserSupabase() } catch {}
    if (!sb) return
    const channel = sb.channel('admin-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hotels' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms'  }, refresh)
      .subscribe()
    return () => { sb!.removeChannel(channel) }
  }, [refresh])

  const addToast = useCallback((msg: string, type: ToastMessage['type'] = 'info') =>
    setToasts(p => [...p, { id: Date.now().toString() + Math.random(), message: msg, type }]), [])

  const patchHotel = async (id: string, body: object, success: string) => {
    const res = await fetch(`/api/admin/hotels/${id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 401 || res.status === 403) {
      addToast('Admin role missing on your Clerk user. See banner above.', 'error'); return
    }
    if (!res.ok) { addToast((await res.json().catch(() => ({}))).error || 'Update failed', 'error'); return }
    addToast(success, 'success'); refresh()
  }

  const approveHotel = (id: string) => patchHotel(id, { approved: true }, 'Hotel approved · Now live')
  const suspendHotel = (id: string) => patchHotel(id, { approved: false }, 'Hotel suspended')

  const deleteHotel = async (id: string, name: string) => {
    if (!confirm(`Permanently delete "${name}"? This will also remove all its rooms and rates.`)) return
    const res = await fetch(`/api/admin/hotels/${id}`, { method: 'DELETE' })
    if (res.status === 401 || res.status === 403) {
      addToast('Admin role missing on your Clerk user. See banner above.', 'error'); return
    }
    if (!res.ok) { addToast((await res.json().catch(() => ({}))).error || 'Delete failed', 'error'); return }
    addToast(`"${name}" deleted`, 'success'); refresh()
  }

  const patchConcern = async (id: string, body: object, success: string) => {
    const res = await fetch(`/api/concerns/${id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) { addToast(await res.text(), 'error'); return }
    addToast(success, 'success'); refresh()
  }

  const updateConcernStatus = (id: string, status: ConcernStatus) =>
    patchConcern(id, { status }, 'Status updated')

  const submitReply = async (id: string) => {
    if (!replyText.trim()) return
    await patchConcern(id, { adminResponse: replyText.trim() }, 'Response sent')
    setReplyId(null); setReplyText('')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', opacity: 0.5 }}>Loading admin…</div>
      </div>
    )
  }

  const approved = hotels.filter(h => h.approved)
  const pending = hotels.filter(h => !h.approved)
  const openConcerns = concerns.filter(c => c.status === 'open' || c.status === 'in-progress')

  type Lucide = typeof Building2
  const TABS: { key: Tab; label: string; Icon: Lucide; badge?: number }[] = [
    { key: 'overview', label: 'Overview', Icon: LayoutDashboard },
    { key: 'hotels', label: 'Hotels', Icon: Building2, badge: pending.length },
    { key: 'enquiries', label: 'Enquiries', Icon: MessageCircle, badge: enquiries.length },
    { key: 'concerns', label: 'Concerns', Icon: MessageSquare, badge: openConcerns.length },
  ]

  return (
    <>
      <Header />
      <main className="app-shell">
        <div className="dash-header">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>
              <ShieldCheck size={11} strokeWidth={2.5} /> Admin Panel
            </span>
            <h1 className="dash-title">Operations Console</h1>
            <p style={{ fontSize: 14, color: '#414942', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Approve hotels, moderate concerns, monitor the portal.
            </p>
          </div>
          <div className="dash-actions">
            <button onClick={refresh} className="btn-secondary" style={{ padding: '10px 18px', fontSize: 13 }}>
              <RefreshCw size={13} strokeWidth={2.3} /> Refresh
            </button>
          </div>
        </div>

        {authError && (
          <div className="card-elevated" style={{ padding: 18, marginBottom: 20, borderLeft: '4px solid #ba1a1a', background: '#ffdad6' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#93000a', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <AlertTriangle size={14} strokeWidth={2.3} /> Admin actions disabled
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#191c1d', lineHeight: 1.5 }}>{authError}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #edeeef', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '12px 18px', border: 'none', background: 'transparent',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
              color: tab === t.key ? '#00361a' : '#717971', cursor: 'pointer',
              borderBottom: tab === t.key ? '3px solid #00361a' : '3px solid transparent',
              marginBottom: -1, display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <t.Icon size={13} strokeWidth={2.2} />
              {t.label}
              {t.badge ? <span className="badge badge-error" style={{ padding: '2px 8px', fontSize: 9 }}>{t.badge}</span> : null}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="stat-grid">
            {[
              { label: 'Total Hotels', value: String(hotels.length), sub: `${approved.length} approved · ${pending.length} pending`, Icon: Building2, accent: '#00361a' },
              { label: 'Pending Approval', value: String(pending.length), sub: pending.length ? 'Action required' : 'All clear', Icon: Clock, accent: '#f09f5e' },
              { label: 'Open Concerns', value: String(openConcerns.length), sub: 'Requires response', Icon: MessageSquare, accent: '#ba1a1a' },
              { label: 'Total Concerns', value: String(concerns.length), sub: 'All time', Icon: BarChart3, accent: '#13677b' },
            ].map((c, i) => (
              <div key={i} className="card-elevated" style={{ padding: '22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="t-overline">{c.label}</div>
                  <div style={{ width: 36, height: 36, borderRadius: 9999, background: '#f3f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <c.Icon size={16} strokeWidth={2.2} color={c.accent} />
                  </div>
                </div>
                <div className="stat-value">{c.value}</div>
                <div style={{ fontSize: 12, color: '#717971', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{c.sub}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'hotels' && (
          <div className="card-elevated table-scroll" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)' }}>
                  {['', 'Hotel', 'Location', 'Star', 'Inventory', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)', textAlign: 'left', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hotels.map(h => (
                  <Fragment key={h.id}>
                  <tr>
                    <td style={{ padding: '14px 8px', width: 36, background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                      <button
                        onClick={() => setExpandedHotelId(prev => prev === h.id ? null : h.id)}
                        title="View details submitted by hotel"
                        style={{
                          width: 28, height: 28, borderRadius: 9999, border: 'none',
                          background: expandedHotelId === h.id ? '#00361a' : '#f3f4f5',
                          color: expandedHotelId === h.id ? '#ffffff' : '#414942',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {expandedHotelId === h.id ? <ChevronUp size={14} strokeWidth={2.4} /> : <ChevronDown size={14} strokeWidth={2.4} />}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#191c1d', fontFamily: 'Inter, sans-serif' }}>{h.name}</div>
                      <div style={{ fontSize: 11, color: '#717971', marginTop: 3, fontFamily: 'Inter, sans-serif' }}>{h.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#414942', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>{h.locationLabel}</td>
                    <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                      <span className="badge badge-neutral">{STAR_LABELS[h.stars]}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#414942', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                      {availableInventory(h.rooms)}/{totalInventory(h.rooms)}
                    </td>
                    <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                      {h.approved
                        ? <span className="badge badge-success"><CheckCircle2 size={11} strokeWidth={2.5} /> Approved</span>
                        : <span className="badge badge-tertiary"><Clock size={11} strokeWidth={2.5} /> Pending</span>
                      }
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#717971', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>{timeAgo(h.createdAt)}</td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {h.approved ? (
                          <button
                            onClick={() => suspendHotel(h.id)}
                            style={{
                              padding: '8px 14px', borderRadius: 9999, border: 'none',
                              background: '#fef3c7', color: '#6f3800',
                              fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 800,
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                              transition: 'all 0.18s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ffdcc4' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fef3c7' }}
                          >
                            <Pause size={12} strokeWidth={2.3} /> Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => approveHotel(h.id)}
                            className="btn-primary"
                            style={{ padding: '9px 16px', fontSize: 12, boxShadow: '0 4px 14px rgba(0,54,26,0.22)' }}
                          >
                            <CheckCircle2 size={13} strokeWidth={2.5} /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => deleteHotel(h.id, h.name)}
                          style={{
                            padding: '8px 14px', borderRadius: 9999, border: 'none',
                            background: '#ba1a1a', color: '#ffffff',
                            fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 800,
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                            transition: 'all 0.18s', boxShadow: '0 4px 12px rgba(186,26,26,0.25)',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#93000a' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ba1a1a' }}
                          aria-label={`Delete ${h.name}`}
                        >
                          <Trash2 size={12} strokeWidth={2.3} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedHotelId === h.id && (
                    <tr>
                      <td colSpan={8} style={{ padding: 0, background: '#fafbfa', borderBottom: '1px solid #edeeef' }}>
                        <HotelDetailPanel hotel={h} />
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
                {hotels.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px', color: '#717971', fontFamily: 'Inter, sans-serif' }}>No hotels yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'enquiries' && (
          <EnquiriesPanel enquiries={enquiries} />
        )}

        {tab === 'concerns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {concerns.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                <MessageSquare size={40} color="#c1c9bf" style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#414942', marginBottom: 4 }}>No Concerns</p>
                <p style={{ fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#717971' }}>Travel agents will raise concerns from their portal.</p>
              </div>
            )}
            {concerns.map(c => (
              <div key={c.id} className="card-elevated" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status.replace('-', ' ')}</span>
                      <span className={`badge ${PRIORITY_BADGE[c.priority]}`}>{c.priority} priority</span>
                      <span className="badge badge-neutral">{c.category}</span>
                    </div>
                    <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#00361a', margin: 0 }}>{c.subject}</h3>
                    <div style={{ fontSize: 12, color: '#717971', marginTop: 4, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      <strong style={{ color: '#414942' }}>{c.hotelName}</strong> · {c.agentName} ({c.agentCompany}) · {timeAgo(c.createdAt)}
                    </div>
                  </div>
                  <select value={c.status} onChange={e => updateConcernStatus(c.id, e.target.value as ConcernStatus)} className="input-field" style={{ padding: '8px 12px', fontSize: 12, width: 'auto' }}>
                    <option value="open">Open</option>
                    <option value="in-progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <p style={{ fontSize: 14, color: '#414942', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: '0 0 16px' }}>{c.description}</p>

                {c.adminResponse && (
                  <div className="card-section" style={{ padding: 14, marginBottom: 14 }}>
                    <div className="t-overline" style={{ marginBottom: 6 }}>Admin response · {timeAgo(c.adminResponseAt)}</div>
                    <div style={{ fontSize: 13, color: '#191c1d', fontFamily: 'Inter, sans-serif', lineHeight: 1.55 }}>{c.adminResponse}</div>
                  </div>
                )}

                {replyId === c.id ? (
                  <div>
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a response to the travel agent…" className="input-field" rows={3} style={{ padding: '11px 14px', fontSize: 13, resize: 'vertical', marginBottom: 10 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => submitReply(c.id)} className="btn-primary" style={{ padding: '9px 18px', fontSize: 12 }}>
                        <Send size={12} strokeWidth={2.3} /> Send Response
                      </button>
                      <button onClick={() => { setReplyId(null); setReplyText('') }} className="btn-secondary" style={{ padding: '9px 16px', fontSize: 12 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setReplyId(c.id); setReplyText('') }} className="btn-secondary" style={{ padding: '9px 18px', fontSize: 12 }}>
                    <MessageSquare size={12} strokeWidth={2.3} /> {c.adminResponse ? 'Update Response' : 'Respond'}
                  </button>
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

// =====================================================================
// Detail panel — shown when an admin expands a hotel row. Renders the
// full submission so admin can decide approve/reject without leaving the
// table.
// =====================================================================
function HotelDetailPanel({ hotel }: { hotel: Hotel }) {
  return (
    <div style={{ padding: '20px 24px', borderTop: '1px solid #edeeef' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
        <DetailRow Icon={Phone}   label="Phone"        value={hotel.phone || '—'} />
        <DetailRow Icon={MessageCircle} label="WhatsApp" value={hotel.whatsapp || '—'} />
        <DetailRow Icon={Mail}    label="Email"        value={hotel.email || '—'} />
        <DetailRow Icon={MapPin}  label="Address"      value={hotel.address || '—'} />
        <DetailRow Icon={Building2} label="Type"       value={hotel.propertyType === 'houseboat' ? 'Houseboat' : 'Hotel'} />
        <DetailRow Icon={Clock}   label="Tariff window" value={hotel.tariffStart && hotel.tariffEnd ? `${hotel.tariffStart} → ${hotel.tariffEnd}` : 'Not set'} />
      </div>

      {hotel.description && (
        <div style={{ padding: 14, borderRadius: 10, background: '#ffffff', border: '1px solid #edeeef', marginBottom: 18 }}>
          <div className="t-overline" style={{ marginBottom: 6 }}>Description</div>
          <div style={{ fontSize: 13, color: '#414942', fontFamily: 'Inter, sans-serif', lineHeight: 1.55 }}>{hotel.description}</div>
        </div>
      )}

      {hotel.amenities && hotel.amenities.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div className="t-overline" style={{ marginBottom: 8 }}>Amenities ({hotel.amenities.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hotel.amenities.map(a => (
              <span key={a} className="badge badge-neutral" style={{ fontSize: 11 }}>{a}</span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="t-overline" style={{ marginBottom: 8 }}>Rooms ({hotel.rooms.length})</div>
        {hotel.rooms.length === 0 ? (
          <div style={{ padding: 14, borderRadius: 10, background: '#fff4f4', color: '#93000a', fontSize: 12.5, fontWeight: 600, border: '1px dashed #ba1a1a' }}>
            <AlertTriangle size={13} strokeWidth={2.4} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            No rooms submitted — nothing for agents to see. Consider rejecting until vendor adds rates.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #edeeef', background: '#ffffff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, fontFamily: 'Inter, sans-serif' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Room', 'Category', 'EP', 'CP', 'MAP', 'AP', 'Extra Bed', 'Child WOB', 'GST', 'Inv', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#717971', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hotel.rooms.map(r => (
                  <tr key={r.id} style={{ borderTop: '1px solid #edeeef' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#191c1d' }}>{r.type}</td>
                    <td style={{ padding: '10px 12px', color: '#414942' }}>{r.category}</td>
                    <td style={{ padding: '10px 12px', color: '#00361a', fontWeight: 700 }}>{r.ep ? fmtINR(r.ep) : '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#00361a', fontWeight: 700 }}>{r.cp ? fmtINR(r.cp) : '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#00361a', fontWeight: 700 }}>{r.map ? fmtINR(r.map) : '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#00361a', fontWeight: 700 }}>{r.ap ? fmtINR(r.ap) : '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#414942' }}>{r.extraBed ? fmtINR(r.extraBed) : '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#414942' }}>{r.childWob ? fmtINR(r.childWob) : '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#717971', fontSize: 11 }}>{GST_LABELS[r.gst] || r.gst}</td>
                    <td style={{ padding: '10px 12px', color: '#414942', fontWeight: 700 }}>{r.inventory}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${r.status === 'Available' ? 'badge-success' : r.status === 'Limited' ? 'badge-tertiary' : 'badge-error'}`} style={{ fontSize: 10 }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({ Icon, label, value }: { Icon: typeof Phone; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9999, background: '#f3f4f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={14} strokeWidth={2.2} color="#00361a" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="t-overline" style={{ fontSize: 9 }}>{label}</div>
        <div style={{ fontSize: 13, color: '#191c1d', fontFamily: 'Inter, sans-serif', fontWeight: 600, wordBreak: 'break-word' }}>{value}</div>
      </div>
    </div>
  )
}

// =====================================================================
// Enquiries log — every WhatsApp enquiry that travellers submit.
// =====================================================================
function EnquiriesPanel({ enquiries }: { enquiries: Enquiry[] }) {
  if (enquiries.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
        <MessageCircle size={40} color="#c1c9bf" style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#414942', marginBottom: 4 }}>No enquiries yet</p>
        <p style={{ fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#717971' }}>Travellers who hit &quot;Enquire on WhatsApp&quot; on the public board show up here.</p>
      </div>
    )
  }
  return (
    <div className="card-elevated table-scroll" style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)' }}>
            {['Sent', 'Traveller', 'Phone', 'Hotel', 'Stay', 'Party', 'Notes', 'WhatsApp'].map(h => (
              <th key={h} style={{ padding: '14px 16px', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)', textAlign: 'left', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {enquiries.map(e => (
            <tr key={e.id} style={{ borderTop: '1px solid #edeeef' }}>
              <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#717971', whiteSpace: 'nowrap' }}>{timeAgo(e.createdAt)}</td>
              <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#191c1d', fontWeight: 700 }}>{e.travellerName}</td>
              <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#414942' }}>
                <a href={`tel:${e.travellerPhone}`} style={{ color: '#13677b', textDecoration: 'none' }}>{e.travellerPhone}</a>
              </td>
              <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#414942' }}>{e.hotelName}</td>
              <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#414942', whiteSpace: 'nowrap' }}>
                {e.checkIn && e.checkOut ? (
                  <>
                    {e.checkIn} → {e.checkOut}
                    <div style={{ fontSize: 11, color: '#717971' }}>{e.nights} night{e.nights === 1 ? '' : 's'}</div>
                  </>
                ) : <span style={{ color: '#9aa19f' }}>Flexible</span>}
              </td>
              <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#414942', whiteSpace: 'nowrap' }}>
                <BedDouble size={11} strokeWidth={2.4} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {e.rooms} rm · {e.adults}A{e.children > 0 ? ` + ${e.children}C` : ''}
              </td>
              <td style={{ padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#414942', maxWidth: 260 }}>
                {e.notes || <span style={{ color: '#9aa19f' }}>—</span>}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <a
                  href={e.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 9999, textDecoration: 'none',
                    background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                    color: '#ffffff', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 800,
                  }}
                ><MessageCircle size={11} strokeWidth={2.6} /> Open chat</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
