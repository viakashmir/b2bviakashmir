'use client'

import { Hotel, STAR_LABELS, fmtINR, fmtDate, bestStatus } from '@/lib/data'
import { useState } from 'react'

interface Props {
  hotel: Hotel
  index: number
}

export default function HotelCard({ hotel, index }: Props) {
  const [showEnquire, setShowEnquire] = useState(false)
  const status = bestStatus(hotel.rooms)
  const availRooms = hotel.rooms.filter(r => r.status === 'Available')
  const limitRooms = hotel.rooms.filter(r => r.status === 'Limited')
  const soldRooms  = hotel.rooms.filter(r => r.status === 'Sold Out')

  const statusBadge = {
    Available: 'badge-success',
    Limited: 'badge-tertiary',
    'Sold Out': 'badge-error',
  }[status] ?? 'badge-neutral'

  const tiles = [
    { key: 'avail', label: 'Available', count: availRooms.reduce((a, r) => a + r.inventory, 0), types: availRooms.length, show: availRooms.length > 0, bg: 'rgba(161,231,255,0.18)', color: '#a1e7ff', subtitle: 'rooms ready' },
    { key: 'limit', label: 'Limited',   count: limitRooms.reduce((a, r) => a + r.inventory, 0), types: limitRooms.length, show: limitRooms.length > 0, bg: 'rgba(255,220,196,0.22)', color: '#ffdcc4', subtitle: 'low stock' },
    { key: 'sold',  label: 'Sold Out',  count: soldRooms.length,                                types: soldRooms.length,  show: soldRooms.length > 0,  bg: 'rgba(255,180,171,0.18)', color: '#ffb4ab', subtitle: 'types' },
  ].filter(t => t.show)

  return (
    <>
      <article
        className="card-elevated"
        style={{
          display: 'flex', flexDirection: 'column',
          transition: 'box-shadow 0.2s, transform 0.2s',
          animation: `card-in 0.4s ease ${index * 0.06}s both`,
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 12px 48px rgba(0,54,26,0.12)'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 40px rgba(25,28,29,0.06)'
        }}
      >
        {/* Header */}
        <div className="hotel-card-header" style={{
          background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)',
          padding: '18px 20px 14px', position: 'relative', overflow: 'hidden',
        }}>
          <i className="fi fi-rr-mountains" style={{
            position: 'absolute', right: -14, top: -14,
            fontSize: 110, color: 'rgba(184,240,197,0.08)', pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 9.5, fontWeight: 800,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: '#b8f0c5',
            }}>
              {STAR_LABELS[hotel.stars]}
            </span>
            <span className={`badge ${statusBadge}`} style={{ padding: '3px 10px', fontSize: 10 }}>{status}</span>
          </div>

          <h3 style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 19, fontWeight: 800,
            color: '#ffffff', lineHeight: 1.18, margin: 0, letterSpacing: '-0.015em',
          }}>
            {hotel.name}
          </h3>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, marginTop: 5,
            fontSize: 11.5, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
            fontFamily: 'Inter, sans-serif',
          }}>
            <i className="fi fi-rr-marker" style={{ fontSize: 11 }} />
            {hotel.locationLabel}
          </div>

          {/* Availability tiles */}
          {tiles.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {tiles.map(t => (
                <div key={t.key} style={{ flex: 1, background: t.bg, borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: t.color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {t.count}
                  </div>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: t.color, opacity: 0.9, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif' }}>
                    {t.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rate table — column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.6fr 1fr 0.85fr 0.95fr 0.55fr',
          padding: '8px 16px 6px', background: '#f3f4f5',
        }}>
          {['Room / Meal', 'Double', 'CNB', 'Extra Bed', 'Rms'].map((h, i) => (
            <div key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: 8.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717971', textAlign: i > 0 ? 'right' : 'left' }}>
              {h}
            </div>
          ))}
        </div>

        {/* Updated timestamp strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 16px',
          background: '#f3f4f5',
          fontSize: 10, color: '#717971', fontFamily: 'Inter, sans-serif',
        }}>
          <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#13677b', display: 'inline-block', flexShrink: 0 }} />
          <i className="fi fi-rr-clock" style={{ fontSize: 9 }} />
          Updated <strong style={{ color: '#414942', fontWeight: 700, marginLeft: 2 }}>{fmtDate(hotel.updatedAt)}</strong>
        </div>

        {/* Rate rows — show ALL rooms */}
        <div style={{ flex: 1 }}>
          {hotel.rooms.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: '#717971', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              No rates published yet
            </div>
          ) : hotel.rooms.map((r, ri) => {
            // Green when plenty, blinking yellow when low (≤3 OR status=Limited), red when sold out.
            const lowStock = r.status === 'Sold Out' || r.inventory === 0
              ? 'avail-red'
              : (r.status === 'Limited' || r.inventory <= 3)
                ? 'avail-amber'
                : 'avail-green'
            return (
              <div key={r.id} style={{
                display: 'grid', gridTemplateColumns: '1.6fr 1fr 0.85fr 0.95fr 0.55fr',
                alignItems: 'center', padding: '10px 16px',
                background: ri % 2 === 1 ? '#f8f9fa' : '#ffffff',
                borderBottom: ri < hotel.rooms.length - 1 ? '1px solid #edeeef' : 'none',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 700, color: '#191c1d', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.type}</div>
                  <div style={{ fontSize: 9.5, color: '#13677b', marginTop: 2, fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.02em' }}>
                    {r.category} · <span style={{ color: '#717971' }}>{r.meal}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#00361a', letterSpacing: '-0.02em' }}>
                    {fmtINR(r.double)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#414942', fontFamily: 'Inter, sans-serif' }}>
                  {r.cnb ? fmtINR(r.cnb) : '—'}
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#414942', fontFamily: 'Inter, sans-serif' }}>
                  {r.extraBed ? fmtINR(r.extraBed) : '—'}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={lowStock} style={{ display: 'inline-block', minWidth: 30, padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                    {r.inventory}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="hotel-card-footer" style={{
          padding: '12px 16px', background: '#ffffff', borderTop: '1px solid #edeeef',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div style={{ fontSize: 11, color: '#717971', lineHeight: 1.5, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <i className="fi fi-rr-phone-call" style={{ fontSize: 11, color: '#414942' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: '#414942' }}>{hotel.phone}</span>
          </div>
          <button
            onClick={() => setShowEnquire(true)}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: 11.5, flexShrink: 0 }}
          >
            <i className="fi fi-rr-paper-plane" style={{ fontSize: 12 }} />
            Enquire
          </button>
        </div>
      </article>

      {showEnquire && (
        <div
          className="modal-wrap"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,54,26,0.55)', zIndex: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            backdropFilter: 'blur(6px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowEnquire(false) }}
        >
          <div className="card-elevated" style={{
            width: '100%', maxWidth: 560, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            animation: 'fade-up 0.25s ease',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)',
              padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: '#b8f0c5',
                  background: 'rgba(184,240,197,0.1)',
                  padding: '4px 10px', borderRadius: 9999, marginBottom: 8,
                }}>
                  {STAR_LABELS[hotel.stars]}
                </span>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, color: '#ffffff', fontWeight: 800, margin: '4px 0', letterSpacing: '-0.02em' }}>{hotel.name}</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: 0, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{hotel.locationLabel}</p>
              </div>
              <button
                onClick={() => setShowEnquire(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', width: 32, height: 32, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close"
              >
                <i className="fi fi-rr-cross-small" style={{ fontSize: 18 }} />
              </button>
            </div>
            <div style={{ padding: 28, overflowY: 'auto' }}>
              {hotel.description && (
                <p style={{ fontSize: 13, color: '#414942', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: '0 0 18px' }}>
                  {hotel.description}
                </p>
              )}
              {[
                { icon: 'fi-rr-phone-call', label: 'Phone', value: hotel.phone },
                { icon: 'fi-rr-envelope', label: 'Email', value: hotel.email },
                { icon: 'fi-rr-marker', label: 'Address', value: hotel.address || hotel.locationLabel },
                { icon: 'fi-rr-globe', label: 'Website', value: hotel.website || '—' },
                { icon: 'fi-rr-clock', label: 'Rates Updated', value: fmtDate(hotel.updatedAt) },
              ].map((row, i, arr) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid #edeeef' : 'none',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 9999, background: '#f3f4f5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#00361a',
                  }}>
                    <i className={`fi ${row.icon}`} style={{ fontSize: 15 }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717971', fontFamily: 'Inter, sans-serif' }}>{row.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#191c1d', marginTop: 3, fontFamily: 'Inter, sans-serif', overflowWrap: 'anywhere' }}>{row.value}</div>
                  </div>
                </div>
              ))}
              {hotel.amenities?.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717971', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>
                    Amenities
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {hotel.amenities.map(a => (
                      <span key={a} className="badge badge-neutral" style={{ fontSize: 10 }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {hotel.rooms.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717971', fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>
                    All Rates (per night, ₹)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 0.9fr 0.5fr', gap: 4, fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
                    {['Room', 'Double', 'CNB', 'X-Bed', 'Rms'].map((h, i) => (
                      <div key={h} style={{ fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717971', textAlign: i > 0 ? 'right' : 'left', paddingBottom: 6, borderBottom: '1px solid #edeeef' }}>{h}</div>
                    ))}
                    {hotel.rooms.map(r => (
                      <div key={r.id} style={{ display: 'contents' }}>
                        <div style={{ padding: '8px 0', fontWeight: 600, color: '#191c1d', borderBottom: '1px solid #f3f4f5' }}>
                          {r.type}
                          <div style={{ fontSize: 10, color: '#717971', fontWeight: 500 }}>{r.category} · {r.meal}</div>
                        </div>
                        <div style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#00361a', borderBottom: '1px solid #f3f4f5' }}>{fmtINR(r.double)}</div>
                        <div style={{ padding: '8px 0', textAlign: 'right', color: '#414942', borderBottom: '1px solid #f3f4f5' }}>{r.cnb ? fmtINR(r.cnb) : '—'}</div>
                        <div style={{ padding: '8px 0', textAlign: 'right', color: '#414942', borderBottom: '1px solid #f3f4f5' }}>{r.extraBed ? fmtINR(r.extraBed) : '—'}</div>
                        <div style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#414942', borderBottom: '1px solid #f3f4f5' }}>{r.inventory}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
