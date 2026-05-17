'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Toast, { ToastMessage } from '@/components/Toast'
import {
  Concern, ConcernStatus, Hotel, STAR_LABELS,
  timeAgo, totalInventory, availableInventory,
} from '@/lib/data'
import { browserSupabase } from '@/lib/supabase'

type Tab = 'overview' | 'hotels' | 'concerns'

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
  const [tab, setTab] = useState<Tab>('overview')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [replyId, setReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const refresh = useCallback(async () => {
    try {
      const [hRes, cRes] = await Promise.all([
        fetch('/api/admin/hotels', { cache: 'no-store' }),
        fetch('/api/concerns', { cache: 'no-store' }),
      ])
      if (hRes.ok) { const j = await hRes.json(); setHotels(j.hotels ?? []) }
      if (cRes.ok) { const j = await cRes.json(); setConcerns(j.concerns ?? []) }
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
    if (!res.ok) { addToast(await res.text(), 'error'); return }
    addToast(success, 'success'); refresh()
  }

  const approveHotel = (id: string) => patchHotel(id, { approved: true }, 'Hotel approved · Now live')
  const suspendHotel = (id: string) => patchHotel(id, { approved: false }, 'Hotel suspended')

  const deleteHotel = async (id: string) => {
    if (!confirm('Permanently delete this hotel?')) return
    const res = await fetch(`/api/admin/hotels/${id}`, { method: 'DELETE' })
    if (!res.ok) { addToast(await res.text(), 'error'); return }
    addToast('Hotel deleted', 'info'); refresh()
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

  const TABS: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: 'overview', label: 'Overview', icon: 'fi-rr-dashboard' },
    { key: 'hotels', label: 'Hotels', icon: 'fi-rr-building', badge: pending.length },
    { key: 'concerns', label: 'Concerns', icon: 'fi-rr-comment-alt-middle', badge: openConcerns.length },
  ]

  return (
    <>
      <Header />
      <main className="app-shell">
        <div className="dash-header">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>
              <i className="fi fi-rr-shield-check" style={{ fontSize: 11 }} /> Admin Panel
            </span>
            <h1 className="dash-title">Operations Console</h1>
            <p style={{ fontSize: 14, color: '#414942', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Approve hotels, moderate concerns, monitor the portal.
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

        {tab === 'overview' && (
          <div className="stat-grid">
            {[
              { label: 'Total Hotels', value: String(hotels.length), sub: `${approved.length} approved · ${pending.length} pending`, icon: 'fi-rr-building', accent: '#00361a' },
              { label: 'Pending Approval', value: String(pending.length), sub: pending.length ? 'Action required' : 'All clear', icon: 'fi-rr-time-check', accent: '#f09f5e' },
              { label: 'Open Concerns', value: String(openConcerns.length), sub: 'Requires response', icon: 'fi-rr-comment-alt-middle', accent: '#ba1a1a' },
              { label: 'Total Concerns', value: String(concerns.length), sub: 'All time', icon: 'fi-rr-chart-line-up', accent: '#13677b' },
            ].map((c, i) => (
              <div key={i} className="card-elevated" style={{ padding: '22px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="t-overline">{c.label}</div>
                  <div style={{ width: 36, height: 36, borderRadius: 9999, background: '#f3f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fi ${c.icon}`} style={{ fontSize: 16, color: c.accent }} />
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
                  {['Hotel', 'Location', 'Star', 'Inventory', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)', textAlign: 'left', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hotels.map(h => (
                  <tr key={h.id}>
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
                        ? <span className="badge badge-success"><i className="fi fi-rs-check-circle" style={{ fontSize: 11 }} /> Approved</span>
                        : <span className="badge badge-tertiary"><i className="fi fi-rr-clock" style={{ fontSize: 11 }} /> Pending</span>
                      }
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#717971', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>{timeAgo(h.createdAt)}</td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', background: 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {h.approved ? (
                          <button onClick={() => suspendHotel(h.id)} className="btn-secondary" style={{ padding: '7px 14px', fontSize: 11 }}>
                            <i className="fi fi-rr-pause" style={{ fontSize: 11 }} /> Suspend
                          </button>
                        ) : (
                          <button onClick={() => approveHotel(h.id)} className="btn-primary" style={{ padding: '7px 14px', fontSize: 11 }}>
                            <i className="fi fi-rr-check" style={{ fontSize: 11 }} /> Approve
                          </button>
                        )}
                        <button onClick={() => deleteHotel(h.id)} style={{ width: 34, height: 34, borderRadius: 9999, border: 'none', background: '#ffdad6', color: '#93000a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Delete">
                          <i className="fi fi-rr-trash" style={{ fontSize: 13 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {hotels.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: '#717971', fontFamily: 'Inter, sans-serif' }}>No hotels yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'concerns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {concerns.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
                <i className="fi fi-rr-comment-alt-middle" style={{ fontSize: 40, color: '#c1c9bf', marginBottom: 12, display: 'block' }} />
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
                        <i className="fi fi-rr-paper-plane" style={{ fontSize: 12 }} /> Send Response
                      </button>
                      <button onClick={() => { setReplyId(null); setReplyText('') }} className="btn-secondary" style={{ padding: '9px 16px', fontSize: 12 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setReplyId(c.id); setReplyText('') }} className="btn-secondary" style={{ padding: '9px 18px', fontSize: 12 }}>
                    <i className="fi fi-rr-comment-alt" style={{ fontSize: 12 }} /> {c.adminResponse ? 'Update Response' : 'Respond'}
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
