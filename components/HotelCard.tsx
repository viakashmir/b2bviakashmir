'use client'

import { Hotel } from '@/lib/data'
import { fmtINR, fmtDate, bestStatus, availableInventory } from '@/lib/storage'
import StarRating from './StarRating'
import { useState } from 'react'

interface Props {
  hotel: Hotel
  index: number
}

const STAR_CATEGORY_LABEL: Record<number, string> = {
  1: '1 Star',
  2: '2 Star',
  3: '3 Star',
  4: '4 Star',
  5: '5 Star Deluxe',
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
        {/* Card Header */}
        <div className="hotel-card-header" style={{
          background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)',
          padding: '22px 24px 20px', position: 'relative', overflow: 'hidden',
        }}>
          <i className="fi fi-rr-mountains" style={{
            position: 'absolute', right: -10, top: -10,
            fontSize: 120, color: 'rgba(184,240,197,0.08)', pointerEvents: 'none',
          }} />

          <div style={{ position: 'absolute', top: 16, right: 16 }}>
            <span className={`badge ${statusBadge}`}>{status}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <StarRating stars={hotel.stars} size={12} variant="light" />
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#b8f0c5',
            }}>
              {STAR_CATEGORY_LABEL[hotel.stars]}
            </span>
          </div>

          <h3 style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700,
            color: '#ffffff', lineHeight: 1.2, margin: 0, letterSpacing: '-0.01em',
          }}>
            {hotel.name}
          </h3>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
            fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.78)',
            fontFamily: 'Inter, sans-serif',
          }}>
            <i className="fi fi-rr-map-marker" style={{ fontSize: 12 }} />
            {hotel.locationLabel}
          </div>
        </div>

        {/* Card Body */}
        <div className="hotel-card-body" style={{ padding: '18px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 11,
            color: '#717971', marginBottom: 14, fontFamily: 'Inter, sans-serif', fontWeight: 500,
          }}>
            <span className="pulse-dot" style={{
              width: 7, height: 7, borderRadius: '50%', background: '#13677b',
              display: 'inline-block',
            }} />
            <i className="fi fi-rr-clock" style={{ fontSize: 11, opacity: 0.6 }} />
            Rates updated: <strong style={{ color: '#414942', fontWeight: 700 }}>{fmtDate(hotel.updatedAt)}</strong>
          </div>

          <div style={{ flex: 1 }}>
            {hotel.rooms.slice(0, 4).map((r, i, arr) => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0',
                background: i !== arr.length - 1 ? 'linear-gradient(to bottom, transparent calc(100% - 1px), #edeeef 100%)' : 'transparent',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#191c1d', fontFamily: 'Inter, sans-serif' }}>{r.type}</div>
                  <div style={{ fontSize: 11, color: '#717971', fontWeight: 500, marginTop: 3, fontFamily: 'Inter, sans-serif' }}>{r.meal}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#00361a', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {fmtINR(r.double)}
                  </div>
                  <div style={{ fontSize: 10, color: '#717971', fontFamily: 'Inter, sans-serif', marginTop: 3, fontWeight: 500 }}>per night · double</div>
                  <div style={{ fontSize: 10, color: '#717971', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                    Sgl: {fmtINR(r.single)} · <span style={{ fontWeight: 700, color: '#414942' }}>{r.inventory} avail</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-section" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 14, padding: '12px 16px',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#00361a', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="fi fi-rr-bed-alt" style={{ fontSize: 13 }} />
              {availInv} rooms available
            </span>
            <span style={{ fontSize: 11, color: '#414942', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {availTypes}/{hotel.rooms.length} types open
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="hotel-card-footer" style={{
          padding: '16px 24px', background: '#f3f4f5',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ fontSize: 12, color: '#414942', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#191c1d' }}>
              <i className="fi fi-rr-phone-call" style={{ fontSize: 11 }} /> {hotel.phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontWeight: 500 }}>
              <i className="fi fi-rr-envelope" style={{ fontSize: 11 }} /> {hotel.email}
            </div>
          </div>
          <button
            onClick={() => setShowEnquire(true)}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: 12 }}
          >
            <i className="fi fi-rr-paper-plane" style={{ fontSize: 13 }} />
            Enquire
          </button>
        </div>
      </article>

      {/* Enquire Modal */}
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
            width: '100%', maxWidth: 480, overflow: 'hidden',
            animation: 'fade-up 0.25s ease',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)',
              padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <StarRating stars={hotel.stars} size={12} variant="light" showLabel />
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, color: '#ffffff', fontWeight: 800, margin: '8px 0 4px', letterSpacing: '-0.02em' }}>{hotel.name}</h3>
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
            <div style={{ padding: 28 }}>
              {[
                { icon: 'fi-rr-phone-call', label: 'Phone', value: hotel.phone },
                { icon: 'fi-rr-envelope', label: 'Email', value: hotel.email },
                { icon: 'fi-rr-map-marker', label: 'Location', value: hotel.locationLabel },
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
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717971', fontFamily: 'Inter, sans-serif' }}>{row.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#191c1d', marginTop: 3, fontFamily: 'Inter, sans-serif' }}>{row.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
