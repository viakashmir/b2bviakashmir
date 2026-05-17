'use client'

import { Hotel, STAR_LABELS } from '@/lib/data'
import { fmtINR, fmtDate, bestStatus, availableInventory } from '@/lib/storage'
import { useState } from 'react'

interface Props {
  hotel: Hotel
  index: number
}

export default function HotelCard({ hotel, index }: Props) {
  const [showEnquire, setShowEnquire] = useState(false)
  const status = bestStatus(hotel.rooms)
  const availInv = availableInventory(hotel.rooms)
  const availTypes = hotel.rooms.filter(r => r.status === 'Available').length

  const statusBadge = {
    Available: 'badge-success',
    Limited: 'badge-tertiary',
    'Sold Out': 'badge-error',
  }[status] ?? 'badge-neutral'

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
        {/* Compact header */}
        <div className="hotel-card-header" style={{
          background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)',
          padding: '18px 20px 16px', position: 'relative', overflow: 'hidden',
        }}>
          <i className="fi fi-rr-mountains" style={{
            position: 'absolute', right: -14, top: -14,
            fontSize: 110, color: 'rgba(184,240,197,0.08)', pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
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
            fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800,
            color: '#ffffff', lineHeight: 1.2, margin: 0, letterSpacing: '-0.015em',
          }}>
            {hotel.name}
          </h3>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, marginTop: 5,
            fontSize: 11.5, fontWeight: 500, color: 'rgba(255,255,255,0.72)',
            fontFamily: 'Inter, sans-serif',
          }}>
            <i className="fi fi-rr-marker" style={{ fontSize: 11 }} />
            {hotel.locationLabel}
          </div>
        </div>

        {/* Availability hero — bigger presence */}
        <div style={{
          padding: '12px 20px',
          background: 'linear-gradient(to right, rgba(19,103,123,0.08) 0%, rgba(19,103,123,0.02) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9999,
              background: 'linear-gradient(135deg, #13677b, #18697e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(19,103,123,0.25)',
            }}>
              <i className="fi fi-rr-bed-alt" style={{ fontSize: 16, color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#00361a', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {availInv}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, fontWeight: 700, color: '#13677b', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                Rooms available
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: '#414942' }}>
              {availTypes}/{hotel.rooms.length}
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9.5, color: '#717971', marginTop: 1, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
              types open
            </div>
          </div>
        </div>

        {/* Rates list */}
        <div className="hotel-card-body" style={{ padding: '6px 20px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            {hotel.rooms.slice(0, 3).map((r, i, arr) => (
              <div key={r.id} style={{
                padding: '12px 0',
                background: i !== arr.length - 1 ? 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' : 'transparent',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#191c1d', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.type}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#717971', fontWeight: 600, marginTop: 2, fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }}>
                      {r.category} · {r.meal}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 19, fontWeight: 800, color: '#00361a', lineHeight: 1, letterSpacing: '-0.02em' }}>
                      {fmtINR(r.double)}
                    </div>
                    <div style={{ fontSize: 9.5, color: '#717971', fontFamily: 'Inter, sans-serif', marginTop: 2, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      per night · double
                    </div>
                  </div>
                </div>
                {/* CNB / Extra Bed / Inventory pills */}
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={ratePillStyle}>
                    <i className="fi fi-rr-child-head" style={{ fontSize: 10, color: '#13677b' }} />
                    CNB <strong style={{ color: '#191c1d', marginLeft: 2 }}>{fmtINR(r.cnb)}</strong>
                  </span>
                  <span style={ratePillStyle}>
                    <i className="fi fi-rr-bed-empty" style={{ fontSize: 10, color: '#13677b' }} />
                    Extra Bed <strong style={{ color: '#191c1d', marginLeft: 2 }}>{fmtINR(r.extraBed)}</strong>
                  </span>
                  <span style={{ ...ratePillStyle, marginLeft: 'auto', background: r.status === 'Available' ? 'rgba(184,240,197,0.5)' : r.status === 'Limited' ? '#ffdcc4' : '#ffdad6', color: r.status === 'Available' ? '#1d5031' : r.status === 'Limited' ? '#6f3800' : '#93000a' }}>
                    {r.inventory} avail
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="hotel-card-footer" style={{
          padding: '12px 20px', background: '#f3f4f5',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div style={{ fontSize: 11, color: '#717971', lineHeight: 1.5, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#13677b', display: 'inline-block' }} />
            <i className="fi fi-rr-clock" style={{ fontSize: 10, opacity: 0.6 }} />
            Updated <strong style={{ color: '#414942', fontWeight: 700 }}>{fmtDate(hotel.updatedAt)}</strong>
          </div>
          <button
            onClick={() => setShowEnquire(true)}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: 11.5 }}
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
            width: '100%', maxWidth: 520, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
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
                { icon: 'fi-rr-bed-alt', label: 'Available Today', value: `${availInv} rooms across ${hotel.rooms.length} types` },
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
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const ratePillStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '4px 10px',
  background: '#f3f4f5',
  borderRadius: 9999,
  fontSize: 10.5,
  fontWeight: 600,
  color: '#414942',
  fontFamily: 'Inter, sans-serif',
  letterSpacing: '0.01em',
}
