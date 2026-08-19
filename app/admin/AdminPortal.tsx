'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import {
  ShieldCheck, RefreshCw, Building2, Clock, MessageSquare, TrendingUp,
  Trash2, Pause, CheckCircle2, AlertTriangle, Send, BarChart3, LayoutDashboard,
  ChevronDown, ChevronUp, MessageCircle, BedDouble,
  Plus, Save, X as XIcon, Calendar,
} from 'lucide-react'
import Header from '@/components/Header'
import Toast, { ToastMessage } from '@/components/Toast'
import BrandedDatePicker from '@/components/BrandedDatePicker'
import {
  Concern, ConcernStatus, Enquiry, Hotel, Room, MealPlan, RoomCategory, GstStatus,
  STAR_LABELS, GST_LABELS, LOCATIONS, MEAL_LABELS,
  categoriesFor, amenitiesFor,
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
  const [showAddHotel, setShowAddHotel] = useState(false)

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

  const createHotel = async (body: object) => {
    const res = await fetch('/api/admin/hotels', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 401 || res.status === 403) {
      addToast('Admin role missing on your Clerk user. See banner above.', 'error'); return false
    }
    if (!res.ok) { addToast((await res.json().catch(() => ({}))).error || 'Create failed', 'error'); return false }
    const json = await res.json().catch(() => ({}))
    addToast('Hotel created · Now live', 'success')
    if (json.inviteMessage) addToast(json.inviteMessage, 'info')
    refresh()
    return true
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
        <div style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', opacity: 0.5 }}>Loading admin…</div>
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
            <p style={{ fontSize: 14, color: '#414942', marginTop: 8, fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontWeight: 500 }}>
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
            <div style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 13, fontWeight: 700, color: '#93000a', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <AlertTriangle size={14} strokeWidth={2.3} /> Admin actions disabled
            </div>
            <div style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 13, color: '#191c1d', lineHeight: 1.5 }}>{authError}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #edeeef', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '12px 18px', border: 'none', background: 'transparent',
              fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 13, fontWeight: 700,
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
                <div style={{ fontSize: 12, color: '#717971', marginTop: 8, fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontWeight: 500 }}>{c.sub}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'hotels' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => setShowAddHotel(f => !f)} className="btn-primary" style={{ padding: '11px 20px', fontSize: 13 }}>
                {showAddHotel ? (<><XIcon size={13} strokeWidth={2.5} /> Cancel</>) : (<><Plus size={13} strokeWidth={2.5} /> Add Hotel</>)}
              </button>
            </div>

            {showAddHotel && (
              <AddHotelForm
                onCreate={async body => { const ok = await createHotel(body); if (ok) setShowAddHotel(false) }}
                onCancel={() => setShowAddHotel(false)}
              />
            )}

          <div className="card-elevated table-scroll" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)' }}>
                  {['', 'Hotel', 'Location', 'Star', 'Inventory', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)', textAlign: 'left', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', whiteSpace: 'nowrap' }}>{h}</th>
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
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#191c1d', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif' }}>{h.name}</div>
                      <div style={{ fontSize: 11, color: '#717971', marginTop: 3, fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif' }}>{h.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 13, color: '#414942', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>{h.locationLabel}</td>
                    <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                      <span className="badge badge-neutral">{STAR_LABELS[h.stars]}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 13, color: '#414942', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                      {availableInventory(h.rooms)}/{totalInventory(h.rooms)}
                    </td>
                    <td style={{ padding: '14px 16px', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                      {h.approved
                        ? <span className="badge badge-success"><CheckCircle2 size={11} strokeWidth={2.5} /> Approved</span>
                        : <span className="badge badge-tertiary"><Clock size={11} strokeWidth={2.5} /> Pending</span>
                      }
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 12, color: '#717971', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>{timeAgo(h.createdAt)}</td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {h.approved ? (
                          <button
                            onClick={() => suspendHotel(h.id)}
                            style={{
                              padding: '8px 14px', borderRadius: 9999, border: 'none',
                              background: '#fef3c7', color: '#6f3800',
                              fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 11.5, fontWeight: 800,
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
                            fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 11.5, fontWeight: 800,
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
                        <HotelDetailPanel key={`${h.id}:${h.updatedAt}`} hotel={h} addToast={addToast} onRefresh={refresh} />
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
                {hotels.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px 20px', color: '#717971', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif' }}>No hotels yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          </>
        )}

        {tab === 'enquiries' && (
          <EnquiriesPanel enquiries={enquiries} />
        )}

        {tab === 'concerns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {concerns.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                <MessageSquare size={40} color="#c1c9bf" style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 22, fontWeight: 700, color: '#414942', marginBottom: 4 }}>No Concerns</p>
                <p style={{ fontSize: 14, fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', color: '#717971' }}>Travel agents will raise concerns from their portal.</p>
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
                    <h3 style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 17, fontWeight: 700, color: '#00361a', margin: 0 }}>{c.subject}</h3>
                    <div style={{ fontSize: 12, color: '#717971', marginTop: 4, fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontWeight: 500 }}>
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

                <p style={{ fontSize: 14, color: '#414942', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', lineHeight: 1.6, margin: '0 0 16px' }}>{c.description}</p>

                {c.adminResponse && (
                  <div className="card-section" style={{ padding: 14, marginBottom: 14 }}>
                    <div className="t-overline" style={{ marginBottom: 6 }}>Admin response · {timeAgo(c.adminResponseAt)}</div>
                    <div style={{ fontSize: 13, color: '#191c1d', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', lineHeight: 1.55 }}>{c.adminResponse}</div>
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

const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
  color: '#414942', marginBottom: 8, fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif',
}
const inputStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 13 }

const emptyRoomDraft = {
  type: '', category: 'Deluxe' as RoomCategory, meal: 'CP' as MealPlan,
  ep: '', cp: '', map: '', ap: '', childWob: '', extraBed: '',
  gst: 'as_applicable' as GstStatus, notes: '', inventory: '', status: 'Available' as Room['status'],
}
// emptyRoomDraft.category ('Deluxe') is only valid for hotels — houseboats use
// a disjoint category list, so always seed the draft's category from the
// hotel's actual property type rather than the hardcoded default.
function defaultRoomDraft(propertyType: Hotel['propertyType']) {
  return { ...emptyRoomDraft, category: categoriesFor(propertyType)[0] }
}

// =====================================================================
// Add Hotel, a standalone form for creating a listing directly (no
// vendor signup needed). Rendered above the hotels table.
// =====================================================================
function AddHotelForm({ onCreate, onCancel }: {
  onCreate: (body: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState({
    name: '', stars: 3, location: 'srinagar', locationLabel: 'Srinagar',
    propertyType: 'hotel' as Hotel['propertyType'],
    address: '', phone: '', whatsappSameAsPhone: true, whatsapp: '',
    email: '', website: '', description: '', amenities: [] as string[],
    tariffStart: '', tariffEnd: '', approved: true,
  })
  const [error, setError] = useState('')

  const toggleAmenity = (a: string) => {
    const set = new Set(draft.amenities)
    if (set.has(a)) set.delete(a); else set.add(a)
    setDraft({ ...draft, amenities: Array.from(set) })
  }

  const submit = () => {
    if (!draft.name.trim()) { setError('Hotel name is required.'); return }
    if (!draft.location) { setError('Location is required.'); return }
    setError('')
    onCreate(draft)
  }

  return (
    <div className="card-elevated" style={{ padding: 28, marginBottom: 20 }}>
      <div style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 20, fontWeight: 700, color: '#00361a', marginBottom: 6 }}>New Hotel Listing</div>
      <p style={{ fontSize: 13, color: '#717971', margin: '0 0 22px', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontWeight: 500 }}>
        Created directly, no vendor account needed. Add room rates after saving.
      </p>

      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <div>
          <label style={fieldLabel}>Hotel Name *</label>
          <input type="text" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="input-field" style={inputStyle} placeholder="Hotel Marina Gulmarg" />
        </div>
        <div>
          <label style={fieldLabel}>Star Category</label>
          <select value={draft.stars} onChange={e => setDraft({ ...draft, stars: parseInt(e.target.value) })} className="input-field" style={inputStyle}>
            {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{STAR_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label style={fieldLabel}>Location *</label>
          <select
            value={draft.location}
            onChange={e => {
              const loc = LOCATIONS.find(l => l.value === e.target.value)
              setDraft({ ...draft, location: e.target.value, locationLabel: loc?.label || e.target.value })
            }}
            className="input-field" style={inputStyle}
          >
            {LOCATIONS.filter(l => l.value !== 'all').map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label style={fieldLabel}>Property Type</label>
          <select value={draft.propertyType} onChange={e => setDraft({ ...draft, propertyType: e.target.value as Hotel['propertyType'] })} className="input-field" style={inputStyle}>
            <option value="hotel">Hotel</option>
            <option value="houseboat">Houseboat</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={fieldLabel}>Address</label>
          <input type="text" value={draft.address} onChange={e => setDraft({ ...draft, address: e.target.value })} className="input-field" style={inputStyle} />
        </div>
        <div>
          <label style={fieldLabel}>Phone</label>
          <input type="text" value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} className="input-field" style={inputStyle} placeholder="+919906993545" />
        </div>
        <div>
          <label style={fieldLabel}>Email</label>
          <input type="text" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} className="input-field" style={inputStyle} placeholder="reservations@hotel.in" />
          <p style={{ fontSize: 11, color: '#717971', margin: '6px 0 0', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif' }}>
            If set, a login invite goes out to this address automatically so the hotel can self-manage rates.
          </p>
        </div>
        <div>
          <label style={fieldLabel}>Website</label>
          <input type="text" value={draft.website} onChange={e => setDraft({ ...draft, website: e.target.value })} className="input-field" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 11 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: '#414942', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', cursor: 'pointer' }}>
            <input type="checkbox" checked={draft.whatsappSameAsPhone} onChange={e => setDraft({ ...draft, whatsappSameAsPhone: e.target.checked })} />
            WhatsApp same as phone
          </label>
        </div>
        {!draft.whatsappSameAsPhone && (
          <div>
            <label style={fieldLabel}>WhatsApp</label>
            <input type="text" value={draft.whatsapp} onChange={e => setDraft({ ...draft, whatsapp: e.target.value })} className="input-field" style={inputStyle} />
          </div>
        )}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={fieldLabel}>Description</label>
          <textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} className="input-field" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
      </div>

      <div style={{ marginTop: 22, padding: 18, borderRadius: 14, background: 'linear-gradient(135deg, rgba(255,220,196,0.32), rgba(184,240,197,0.28))', border: '1px solid rgba(240,159,94,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Calendar size={14} strokeWidth={2.5} color="#6f3800" />
          <label style={{ ...fieldLabel, marginBottom: 0, color: '#6f3800' }}>Tariff valid period</label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <BrandedDatePicker label="Valid from" value={draft.tariffStart} max={draft.tariffEnd || undefined} onChange={v => setDraft({ ...draft, tariffStart: v })} placeholder="Pick start date" />
          <BrandedDatePicker label="Valid till" value={draft.tariffEnd} min={draft.tariffStart || undefined} onChange={v => setDraft({ ...draft, tariffEnd: v })} placeholder="Pick end date" />
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <label style={{ ...fieldLabel, marginBottom: 12 }}>Amenities</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {amenitiesFor(draft.propertyType).map(a => {
            const active = draft.amenities.includes(a)
            return (
              <button key={a} onClick={() => toggleAmenity(a)} type="button" style={{
                padding: '8px 14px', borderRadius: 9999, border: 'none',
                background: active ? 'linear-gradient(135deg, #00361a, #1a4d2e)' : '#f3f4f5',
                color: active ? '#ffffff' : '#414942',
                fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {active ? <CheckCircle2 size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2.5} />}
                {a}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: '#414942', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', cursor: 'pointer' }}>
          <input type="checkbox" checked={draft.approved} onChange={e => setDraft({ ...draft, approved: e.target.checked })} />
          Live on public board immediately (uncheck to save as a draft awaiting approval)
        </label>
      </div>

      {error && (
        <p style={{ fontSize: 12, color: '#93000a', margin: '16px 0 0', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontWeight: 600 }}>
          <XIcon size={13} strokeWidth={2.5} style={{ marginRight: 6, verticalAlign: 'middle' }} /> {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <button onClick={submit} className="btn-primary" style={{ padding: '12px 24px', fontSize: 13 }}>
          <Plus size={13} strokeWidth={2.5} /> Create Hotel
        </button>
        <button onClick={onCancel} className="btn-secondary" style={{ padding: '12px 22px', fontSize: 13 }}>Cancel</button>
      </div>
    </div>
  )
}

// =====================================================================
// Detail panel, shown when an admin expands a hotel row. Full profile
// editor + room rate management, all changes go live immediately.
// =====================================================================
function HotelDetailPanel({ hotel, addToast, onRefresh }: {
  hotel: Hotel
  addToast: (msg: string, type?: ToastMessage['type']) => void
  onRefresh: () => void
}) {
  const [draft, setDraft] = useState<Hotel>(hotel)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoom, setNewRoom] = useState(() => defaultRoomDraft(hotel.propertyType))
  const [roomError, setRoomError] = useState('')
  const [invitePending, setInvitePending] = useState(false)
  const hasVendorAccount = hotel.id.startsWith('vendor_')

  const toggleAmenity = (a: string) => {
    const set = new Set(draft.amenities)
    if (set.has(a)) set.delete(a); else set.add(a)
    setDraft({ ...draft, amenities: Array.from(set) })
  }

  const saveProfile = async () => {
    const res = await fetch(`/api/admin/hotels/${hotel.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: draft.name, stars: draft.stars, location: draft.location, locationLabel: draft.locationLabel,
        propertyType: draft.propertyType, address: draft.address, phone: draft.phone,
        whatsapp: draft.whatsapp || draft.phone,
        email: draft.email, website: draft.website, description: draft.description,
        amenities: draft.amenities,
        tariffStart: draft.tariffStart || null, tariffEnd: draft.tariffEnd || null,
      }),
    })
    if (!res.ok) { addToast((await res.json().catch(() => ({}))).error || 'Save failed', 'error'); return }
    addToast('Hotel profile saved', 'success'); onRefresh()
  }

  const sendInvite = async () => {
    setInvitePending(true)
    const res = await fetch(`/api/admin/hotels/${hotel.id}/invite`, { method: 'POST' })
    const json = await res.json().catch(() => ({}))
    setInvitePending(false)
    addToast(json.message || json.error || 'Something went wrong', res.ok ? 'success' : 'error')
  }

  const addRoom = async () => {
    setRoomError('')
    if (!newRoom.type.trim()) { setRoomError('Room type name is required.'); return }
    const res = await fetch(`/api/admin/hotels/${hotel.id}/rooms`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newRoom),
    })
    if (!res.ok) { setRoomError((await res.json().catch(() => ({}))).error || 'Add failed'); return }
    setNewRoom(defaultRoomDraft(draft.propertyType)); setShowAddRoom(false)
    addToast(`"${newRoom.type.trim()}" added · Now live`, 'success'); onRefresh()
  }

  const saveRoom = async (roomId: string, patch: Partial<Room>) => {
    const res = await fetch(`/api/admin/hotels/${hotel.id}/rooms/${roomId}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) { addToast((await res.json().catch(() => ({}))).error || 'Save failed', 'error'); return false }
    addToast('Room saved', 'success'); onRefresh()
    return true
  }

  const deleteRoom = async (roomId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/hotels/${hotel.id}/rooms/${roomId}`, { method: 'DELETE' })
    if (!res.ok) { addToast((await res.json().catch(() => ({}))).error || 'Delete failed', 'error'); return }
    addToast(`"${name}" removed`, 'info'); onRefresh()
  }

  return (
    <div style={{ padding: '20px 24px', borderTop: '1px solid #edeeef' }}>
      <div className="t-overline" style={{ marginBottom: 12 }}>Hotel Profile</div>
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start', marginBottom: 18 }}>
        <div>
          <label style={fieldLabel}>Hotel Name</label>
          <input type="text" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="input-field" style={inputStyle} />
        </div>
        <div>
          <label style={fieldLabel}>Star Category</label>
          <select value={draft.stars} onChange={e => setDraft({ ...draft, stars: parseInt(e.target.value) as Hotel['stars'] })} className="input-field" style={inputStyle}>
            {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{STAR_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label style={fieldLabel}>Location</label>
          <select
            value={draft.location}
            onChange={e => {
              const loc = LOCATIONS.find(l => l.value === e.target.value)
              setDraft({ ...draft, location: e.target.value as Hotel['location'], locationLabel: loc?.label || e.target.value })
            }}
            className="input-field" style={inputStyle}
          >
            {LOCATIONS.filter(l => l.value !== 'all').map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label style={fieldLabel}>Property Type</label>
          <select value={draft.propertyType} onChange={e => setDraft({ ...draft, propertyType: e.target.value as Hotel['propertyType'] })} className="input-field" style={inputStyle}>
            <option value="hotel">Hotel</option>
            <option value="houseboat">Houseboat</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={fieldLabel}>Address</label>
          <input type="text" value={draft.address} onChange={e => setDraft({ ...draft, address: e.target.value })} className="input-field" style={inputStyle} />
        </div>
        <div>
          <label style={fieldLabel}>Phone</label>
          <input type="text" value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} className="input-field" style={inputStyle} />
        </div>
        <div>
          <label style={fieldLabel}>WhatsApp</label>
          <input type="text" value={draft.whatsapp} onChange={e => setDraft({ ...draft, whatsapp: e.target.value })} className="input-field" style={inputStyle} />
        </div>
        <div>
          <label style={fieldLabel}>Email</label>
          <input type="text" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} className="input-field" style={inputStyle} />
        </div>
        <div>
          <label style={fieldLabel}>Website</label>
          <input type="text" value={draft.website} onChange={e => setDraft({ ...draft, website: e.target.value })} className="input-field" style={inputStyle} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={fieldLabel}>Description</label>
          <textarea value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} className="input-field" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
      </div>

      <div style={{ marginBottom: 18, padding: 18, borderRadius: 14, background: 'linear-gradient(135deg, rgba(255,220,196,0.32), rgba(184,240,197,0.28))', border: '1px solid rgba(240,159,94,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Calendar size={14} strokeWidth={2.5} color="#6f3800" />
          <label style={{ ...fieldLabel, marginBottom: 0, color: '#6f3800' }}>Tariff valid period</label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <BrandedDatePicker label="Valid from" value={draft.tariffStart} max={draft.tariffEnd || undefined} onChange={v => setDraft({ ...draft, tariffStart: v })} placeholder="Pick start date" />
          <BrandedDatePicker label="Valid till" value={draft.tariffEnd} min={draft.tariffStart || undefined} onChange={v => setDraft({ ...draft, tariffEnd: v })} placeholder="Pick end date" />
        </div>
      </div>

      <div style={{
        marginBottom: 18, padding: 16, borderRadius: 14,
        background: hasVendorAccount ? '#f0f9f2' : '#f3f4f5',
        border: `1px solid ${hasVendorAccount ? '#b8f0c5' : '#edeeef'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 13, fontWeight: 800, color: '#00361a', marginBottom: 3 }}>
            Hotel Login Access
          </div>
          <div style={{ fontSize: 12, color: '#414942', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif' }}>
            {hasVendorAccount
              ? 'This hotel has its own vendor login and manages its rates directly.'
              : hotel.email
                ? (draft.email !== hotel.email
                    ? 'Save the profile first — the invite goes to the saved email, not what\'s typed above yet.'
                    : 'No vendor login yet — invite one so the hotel can manage its own rates and inventory.')
                : 'No email on file yet — add one above and save before inviting a login.'}
          </div>
        </div>
        {hasVendorAccount ? (
          <span className="badge badge-success"><CheckCircle2 size={11} strokeWidth={2.5} /> Vendor account linked</span>
        ) : (
          <button onClick={sendInvite} disabled={invitePending || !hotel.email || draft.email !== hotel.email} className="btn-primary" style={{ padding: '10px 18px', fontSize: 12.5, opacity: invitePending || !hotel.email || draft.email !== hotel.email ? 0.6 : 1 }}>
            <Send size={12} strokeWidth={2.3} /> {invitePending ? 'Sending…' : 'Send Login Invite'}
          </button>
        )}
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ ...fieldLabel, marginBottom: 12 }}>Amenities</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {amenitiesFor(draft.propertyType).map(a => {
            const active = draft.amenities.includes(a)
            return (
              <button key={a} onClick={() => toggleAmenity(a)} type="button" style={{
                padding: '8px 14px', borderRadius: 9999, border: 'none',
                background: active ? 'linear-gradient(135deg, #00361a, #1a4d2e)' : '#f3f4f5',
                color: active ? '#ffffff' : '#414942',
                fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {active ? <CheckCircle2 size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2.5} />}
                {a}
              </button>
            )
          })}
        </div>
      </div>

      <button onClick={saveProfile} className="btn-primary" style={{ padding: '12px 24px', fontSize: 13, marginBottom: 28 }}>
        <Save size={13} strokeWidth={2.3} /> Save Profile
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
        <div className="t-overline">Rooms ({hotel.rooms.length})</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a
            href={`https://www.makemytrip.com/hotels/hotel-listing/?searchText=${encodeURIComponent(`${draft.name} ${draft.locationLabel}`)}`}
            target="_blank" rel="noreferrer"
            style={{ fontSize: 11.5, fontWeight: 700, color: '#bf3100', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >MakeMyTrip ↗</a>
          <a
            href={`https://www.goibibo.com/hotels/find-hotels/?locusValue=${encodeURIComponent(`${draft.name} ${draft.locationLabel}`)}`}
            target="_blank" rel="noreferrer"
            style={{ fontSize: 11.5, fontWeight: 700, color: '#bf3100', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >Goibibo ↗</a>
          <button onClick={() => setShowAddRoom(f => !f)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12 }}>
            {showAddRoom ? (<><XIcon size={12} strokeWidth={2.5} /> Cancel</>) : (<><Plus size={12} strokeWidth={2.5} /> Add Room Type</>)}
          </button>
        </div>
      </div>

      {hotel.rooms.length === 0 && !showAddRoom && (
        <div style={{ padding: 14, borderRadius: 10, background: '#fff4f4', color: '#93000a', fontSize: 12.5, fontWeight: 600, border: '1px dashed #ba1a1a', marginBottom: 14 }}>
          <AlertTriangle size={13} strokeWidth={2.4} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          No rooms yet, nothing for agents to see. Add at least one room type below.
        </div>
      )}

      {hotel.rooms.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #edeeef', background: '#ffffff', marginBottom: 14 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Room', 'Category', 'Meal', 'EP', 'CP', 'MAP', 'AP', 'Extra Bed', 'Child WOB', 'GST', 'MMT ₹', 'Goibibo ₹', 'Inv', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#717971', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hotel.rooms.map(r => (
                <AdminRoomRow key={r.id} room={r} propertyType={draft.propertyType} onSave={patch => saveRoom(r.id, patch)} onDelete={() => deleteRoom(r.id, r.type)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddRoom && (
        <div className="card-elevated" style={{ padding: 20 }}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={fieldLabel}>Room Type *</label>
              <input type="text" value={newRoom.type} onChange={e => setNewRoom({ ...newRoom, type: e.target.value })} className="input-field" style={inputStyle} placeholder="Deluxe Room" />
            </div>
            <div>
              <label style={fieldLabel}>Category</label>
              <select value={newRoom.category} onChange={e => setNewRoom({ ...newRoom, category: e.target.value as RoomCategory })} className="input-field" style={inputStyle}>
                {categoriesFor(draft.propertyType).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabel}>Meal Plan</label>
              <select value={newRoom.meal} onChange={e => setNewRoom({ ...newRoom, meal: e.target.value as MealPlan })} className="input-field" style={inputStyle}>
                {(Object.keys(MEAL_LABELS) as MealPlan[]).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {(['ep', 'cp', 'map', 'ap', 'extraBed', 'childWob'] as const).map(f => (
              <div key={f}>
                <label style={fieldLabel}>{f === 'map' ? 'MAP ₹' : f === 'extraBed' ? 'Extra Bed ₹' : f === 'childWob' ? 'Child WOB ₹' : `${f.toUpperCase()} ₹`}</label>
                <input type="number" value={(newRoom as Record<string, string>)[f]} onChange={e => setNewRoom({ ...newRoom, [f]: e.target.value })} className="input-field" style={inputStyle} placeholder="0" />
              </div>
            ))}
            <div>
              <label style={fieldLabel}>GST</label>
              <select value={newRoom.gst} onChange={e => setNewRoom({ ...newRoom, gst: e.target.value as GstStatus })} className="input-field" style={inputStyle}>
                {(Object.keys(GST_LABELS) as GstStatus[]).map(g => <option key={g} value={g}>{GST_LABELS[g]}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabel}>Rooms Available</label>
              <input type="number" value={newRoom.inventory} onChange={e => setNewRoom({ ...newRoom, inventory: e.target.value })} className="input-field" style={inputStyle} placeholder="5" />
            </div>
            <div>
              <label style={fieldLabel}>Status</label>
              <select value={newRoom.status} onChange={e => setNewRoom({ ...newRoom, status: e.target.value as Room['status'] })} className="input-field" style={inputStyle}>
                <option>Available</option><option>Limited</option><option>Sold Out</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={fieldLabel}>Notes</label>
              <input type="text" value={newRoom.notes} onChange={e => setNewRoom({ ...newRoom, notes: e.target.value })} className="input-field" style={inputStyle} placeholder="Extra bed Rs 800/1000/1200, GST as applicable…" />
            </div>
          </div>
          {roomError && (
            <p style={{ fontSize: 12, color: '#93000a', margin: '14px 0 0', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontWeight: 600 }}>
              <XIcon size={13} strokeWidth={2.5} style={{ marginRight: 6, verticalAlign: 'middle' }} /> {roomError}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={addRoom} className="btn-primary" style={{ padding: '11px 22px', fontSize: 13 }}>
              <Plus size={13} strokeWidth={2.5} /> Add Room Type
            </button>
            <button onClick={() => { setShowAddRoom(false); setRoomError('') }} className="btn-secondary" style={{ padding: '11px 20px', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminRoomRow({ room, propertyType, onSave, onDelete }: {
  room: Room
  propertyType: Hotel['propertyType']
  onSave: (patch: Partial<Room>) => Promise<boolean>
  onDelete: () => void
}) {
  const [draft, setDraft] = useState<Partial<Room>>({})
  const [saving, setSaving] = useState(false)
  const merged = { ...room, ...draft }
  const change = (k: keyof Room, v: string | number) => setDraft(d => ({ ...d, [k]: v }))
  const cellStyle: React.CSSProperties = { padding: '8px 10px', borderTop: '1px solid #edeeef' }
  const numInput: React.CSSProperties = { width: 76, padding: '6px 8px', fontSize: 12 }
  const ourRate = merged.cp || merged.map || merged.ap || merged.ep
  const delta = (competitor: number) => {
    if (!ourRate || !competitor) return null
    const diff = ourRate - competitor
    if (diff === 0) return <span style={{ color: '#717971' }}>Matched</span>
    return diff < 0
      ? <span style={{ color: '#146c2e' }}>▼ {fmtINR(-diff)} lower</span>
      : <span style={{ color: '#93000a' }}>▲ {fmtINR(diff)} higher</span>
  }

  return (
    <tr>
      <td style={cellStyle}><input value={merged.type} onChange={e => change('type', e.target.value)} className="input-field" style={{ width: 130, padding: '6px 8px', fontSize: 12 }} /></td>
      <td style={cellStyle}>
        <select className="input-field" value={merged.category} onChange={e => change('category', e.target.value)} style={{ padding: '6px 8px', fontSize: 12, width: 'auto' }}>
          {categoriesFor(propertyType).map(c => <option key={c}>{c}</option>)}
        </select>
      </td>
      <td style={cellStyle}>
        <select className="input-field" value={merged.meal} onChange={e => change('meal', e.target.value)} style={{ padding: '6px 8px', fontSize: 12, width: 'auto' }}>
          <option value="CP">CP</option><option value="MAP">MAP</option><option value="AP">AP</option><option value="EP">EP</option>
        </select>
      </td>
      {(['ep', 'cp', 'map', 'ap', 'extraBed', 'childWob'] as const).map(f => (
        <td key={f} style={cellStyle}>
          <input type="number" min={0} className="input-field" style={numInput} value={(merged as Record<string, unknown>)[f] as number} onChange={e => change(f, parseInt(e.target.value) || 0)} />
        </td>
      ))}
      <td style={cellStyle}>
        <select className="input-field" value={merged.gst} onChange={e => change('gst', e.target.value)} style={{ padding: '6px 8px', fontSize: 11, width: 'auto' }}>
          {(Object.keys(GST_LABELS) as GstStatus[]).map(g => <option key={g} value={g}>{GST_LABELS[g]}</option>)}
        </select>
      </td>
      <td style={cellStyle}>
        <input type="number" min={0} className="input-field" style={numInput} value={merged.mmtPrice || ''} onChange={e => change('mmtPrice', parseInt(e.target.value) || 0)} placeholder="—" />
        {delta(merged.mmtPrice) && <div style={{ fontSize: 10, fontWeight: 700, marginTop: 3, whiteSpace: 'nowrap' }}>{delta(merged.mmtPrice)}</div>}
      </td>
      <td style={cellStyle}>
        <input type="number" min={0} className="input-field" style={numInput} value={merged.goibiboPrice || ''} onChange={e => change('goibiboPrice', parseInt(e.target.value) || 0)} placeholder="—" />
        {delta(merged.goibiboPrice) && <div style={{ fontSize: 10, fontWeight: 700, marginTop: 3, whiteSpace: 'nowrap' }}>{delta(merged.goibiboPrice)}</div>}
      </td>
      <td style={cellStyle}>
        <input type="number" min={0} className="input-field" style={{ ...numInput, width: 60 }} value={merged.inventory} onChange={e => change('inventory', parseInt(e.target.value) || 0)} />
      </td>
      <td style={cellStyle}>
        <select className="input-field" value={merged.status} onChange={e => change('status', e.target.value)} style={{ padding: '6px 8px', fontSize: 11, width: 'auto' }}>
          <option>Available</option><option>Limited</option><option>Sold Out</option>
        </select>
      </td>
      <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={async () => {
              setSaving(true)
              const ok = await onSave(draft)
              setSaving(false)
              if (ok) setDraft({})
            }}
            disabled={saving}
            className="btn-primary" style={{ padding: '6px 12px', fontSize: 11, opacity: saving ? 0.6 : 1 }}
          >
            <Save size={11} strokeWidth={2.3} /> {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: '6px 10px', borderRadius: 9999, border: 'none',
              background: '#ba1a1a', color: '#ffffff',
              fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 11, fontWeight: 800,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
            }}
            aria-label="Delete room"
          >
            <Trash2 size={11} strokeWidth={2.3} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// =====================================================================
// Enquiries log, every WhatsApp enquiry that travellers submit.
// =====================================================================
function EnquiriesPanel({ enquiries }: { enquiries: Enquiry[] }) {
  if (enquiries.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
        <MessageCircle size={40} color="#c1c9bf" style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
        <p style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 22, fontWeight: 700, color: '#414942', marginBottom: 4 }}>No enquiries yet</p>
        <p style={{ fontSize: 14, fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', color: '#717971' }}>Travellers who hit &quot;Enquire on WhatsApp&quot; on the public board show up here.</p>
      </div>
    )
  }
  return (
    <div className="card-elevated table-scroll" style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)' }}>
            {['Sent', 'Traveller', 'Phone', 'Hotel', 'Stay', 'Party', 'Notes', 'WhatsApp'].map(h => (
              <th key={h} style={{ padding: '14px 16px', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)', textAlign: 'left', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {enquiries.map(e => (
            <tr key={e.id} style={{ borderTop: '1px solid #edeeef' }}>
              <td style={{ padding: '12px 16px', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 12, color: '#717971', whiteSpace: 'nowrap' }}>{timeAgo(e.createdAt)}</td>
              <td style={{ padding: '12px 16px', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 13, color: '#191c1d', fontWeight: 700 }}>{e.travellerName}</td>
              <td style={{ padding: '12px 16px', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 13, color: '#414942' }}>
                <a href={`tel:${e.travellerPhone}`} style={{ color: '#13677b', textDecoration: 'none' }}>{e.travellerPhone}</a>
              </td>
              <td style={{ padding: '12px 16px', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 13, color: '#414942' }}>{e.hotelName}</td>
              <td style={{ padding: '12px 16px', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 12, color: '#414942', whiteSpace: 'nowrap' }}>
                {e.checkIn && e.checkOut ? (
                  <>
                    {e.checkIn} → {e.checkOut}
                    <div style={{ fontSize: 11, color: '#717971' }}>{e.nights} night{e.nights === 1 ? '' : 's'}</div>
                  </>
                ) : <span style={{ color: '#9aa19f' }}>Flexible</span>}
              </td>
              <td style={{ padding: '12px 16px', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 12, color: '#414942', whiteSpace: 'nowrap' }}>
                <BedDouble size={11} strokeWidth={2.4} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {e.rooms} rm · {e.adults}A{e.children > 0 ? ` + ${e.children}C` : ''}
              </td>
              <td style={{ padding: '12px 16px', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 12, color: '#414942', maxWidth: 260 }}>
                {e.notes || <span style={{ color: '#9aa19f' }}>-</span>}
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
                    color: '#ffffff', fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 11, fontWeight: 800,
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
