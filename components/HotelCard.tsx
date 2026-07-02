'use client'

import { Hotel, STAR_LABELS, fmtINR, fmtDate, bestStatus } from '@/lib/data'
import { useState } from 'react'
import {
  MapPin, Phone, Mail, Globe, Clock, BedDouble, Send, X,
  Mountain, Sparkles, MessageCircle,
} from 'lucide-react'
import EnquireWhatsAppModal from '@/components/EnquireWhatsAppModal'

interface Props {
  hotel: Hotel
  index: number
}

export default function HotelCard({ hotel, index }: Props) {
  const [showEnquire, setShowEnquire] = useState(false)
  const [showWa, setShowWa] = useState(false)
  const status = bestStatus(hotel.rooms)
  const availInv = hotel.rooms.filter(r => r.status === 'Available').reduce((a, r) => a + (r.inventory || 0), 0)
  const availTypes = hotel.rooms.filter(r => r.status === 'Available').length
  const limitTypes = hotel.rooms.filter(r => r.status === 'Limited').length
  const soldTypes = hotel.rooms.filter(r => r.status === 'Sold Out').length

  // Header banner color matches the worst-case status of the property.
  const headerAvailClass =
    status === 'Sold Out' ? 'avail-red'
    : status === 'Limited' || availInv <= 3 ? 'avail-amber'
    : 'avail-green'

  const statusBadge = {
    Available: 'badge-success',
    Limited: 'badge-tertiary',
    'Sold Out': 'badge-error',
  }[status] ?? 'badge-neutral'

  return (
    <>
      <article
        className="card-elevated hcard"
        style={{
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
        {/* LEFT — identity panel */}
        <div className="hcard-side">
          <Mountain size={140} color="rgba(184,240,197,0.08)" style={{ position: 'absolute', right: -18, top: -18, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#b8f0c5' }}>
              <Sparkles size={11} strokeWidth={2.5} />
              {STAR_LABELS[hotel.stars]}
            </span>
            <span className={`badge ${statusBadge}`} style={{ padding: '3px 10px', fontSize: 10 }}>{status}</span>
          </div>

          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#ffffff', lineHeight: 1.2, margin: 0, letterSpacing: '-0.015em' }}>
            {hotel.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11.5, fontWeight: 500, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
            <MapPin size={12} strokeWidth={2} />
            {hotel.locationLabel}
          </div>

          <div className={headerAvailClass} style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BedDouble size={18} strokeWidth={2.3} />
              <div>
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>{availInv}</div>
                <div style={{ fontSize: 9, fontWeight: 800, marginTop: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Available</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'Inter, sans-serif', fontSize: 11 }}>
              <div style={{ fontWeight: 800 }}>{availTypes + limitTypes}/{hotel.rooms.length}</div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>types open</div>
            </div>
          </div>

          {hotel.tariffStart && hotel.tariffEnd && (
            <span style={{ display: 'inline-block', marginTop: 12, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2f1400', background: 'rgba(255,220,196,0.9)', padding: '4px 10px', borderRadius: 9999 }}>
              Tariff {shortRange(hotel.tariffStart, hotel.tariffEnd)}
            </span>
          )}
        </div>

        {/* RIGHT — rates & CTA */}
        <div className="hcard-body">
          <div className="hcard-updated">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#13677b', display: 'inline-block', flexShrink: 0 }} />
              <Clock size={10} strokeWidth={2} />
              Updated <strong style={{ color: '#414942', fontWeight: 700, marginLeft: 2 }}>{fmtDate(hotel.updatedAt)}</strong>
            </div>
            <span style={{ fontWeight: 700 }}>{hotel.rooms.length} room {hotel.rooms.length === 1 ? 'type' : 'types'}</span>
          </div>

          {hotel.rooms.length === 0 ? (
            <div style={{ flex: 1, padding: '28px 20px', textAlign: 'center', fontSize: 13, color: '#717971', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              No rates published yet
            </div>
          ) : (
            <div className="hcard-rates">
              {hotel.rooms.map(r => {
                const lowStock = r.status === 'Sold Out' || r.inventory === 0 ? 'avail-red'
                  : (r.status === 'Limited' || r.inventory <= 3) ? 'avail-amber' : 'avail-green'
                const headline = r.meal === 'EP' ? r.ep : r.meal === 'MAP' ? r.map : r.meal === 'AP' ? r.ap : r.cp || r.double
                const offered = [
                  { code: 'EP',  val: r.ep },
                  { code: 'CP',  val: r.cp || (r.meal === 'CP' ? r.double : 0) },
                  { code: 'MAP', val: r.map },
                  { code: 'AP',  val: r.ap },
                ].filter(p => p.val > 0)
                return (
                  <div key={r.id} className="rate-cell">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#191c1d', lineHeight: 1.25 }}>{r.type}</div>
                        <div style={{ fontSize: 9.5, color: '#13677b', marginTop: 2, fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.02em' }}>{r.category}</div>
                      </div>
                      <span className={lowStock} style={{ flexShrink: 0, display: 'inline-block', padding: '3px 9px', borderRadius: 9999, fontSize: 9.5, fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                        {r.inventory} {r.inventory === 1 ? 'room' : 'rooms'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: '#13677b' }}>{r.meal}</span>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#00361a', letterSpacing: '-0.02em' }}>{fmtINR(headline)}</span>
                      <span style={{ fontSize: 10, color: '#717971', fontWeight: 600 }}>/night</span>
                    </div>

                    {offered.length > 1 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                        {offered.map(p => (
                          <span key={p.code} style={{
                            fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif', padding: '3px 8px', borderRadius: 9999,
                            background: p.code === r.meal ? 'rgba(0,54,26,0.08)' : '#eef0ef',
                            color: p.code === r.meal ? '#00361a' : '#414942',
                            border: p.code === r.meal ? '1px solid rgba(0,54,26,0.15)' : '1px solid transparent',
                          }}>
                            <strong>{p.code}</strong> {fmtINR(p.val)}
                          </span>
                        ))}
                      </div>
                    )}

                    {(r.extraBed > 0 || r.childWob > 0) && (
                      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10, color: '#717971', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                        {r.extraBed > 0 && <span>Extra Bed <strong style={{ color: '#414942' }}>{fmtINR(r.extraBed)}</strong></span>}
                        {r.childWob > 0 && <span>Child WOB <strong style={{ color: '#414942' }}>{fmtINR(r.childWob)}</strong></span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="hcard-foot">
            <div style={{ fontSize: 11.5, color: '#717971', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={13} strokeWidth={2} />
              <span style={{ fontWeight: 600, color: '#414942' }}>Contact via Enquire</span>
            </div>
            <button onClick={() => setShowEnquire(true)} className="btn-primary" style={{ padding: '9px 20px', fontSize: 12.5, flexShrink: 0 }}>
              <Send size={13} strokeWidth={2.5} />
              Enquire
            </button>
          </div>
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
            width: '100%', maxWidth: 540, overflow: 'hidden', maxHeight: '92vh', display: 'flex', flexDirection: 'column',
            animation: 'fade-up 0.25s ease',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)',
              padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: '#b8f0c5',
                  background: 'rgba(184,240,197,0.12)',
                  padding: '5px 12px', borderRadius: 9999, marginBottom: 10,
                }}>
                  <Sparkles size={11} strokeWidth={2.5} />
                  {STAR_LABELS[hotel.stars]}
                </span>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, color: '#ffffff', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{hotel.name}</h3>
                <p style={{
                  fontSize: 12.5, color: 'rgba(255,255,255,0.72)',
                  margin: '6px 0 0', fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  <MapPin size={12} strokeWidth={2} /> {hotel.locationLabel}
                </p>
              </div>
              <button
                onClick={() => setShowEnquire(false)}
                style={{ background: 'rgba(255,255,255,0.14)', border: 'none', color: '#ffffff', cursor: 'pointer', width: 34, height: 34, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
              {/* Hero WhatsApp CTA, primary action of the modal */}
              <button
                onClick={() => setShowWa(true)}
                style={{
                  width: '100%', marginBottom: 22, padding: '16px 22px',
                  borderRadius: 16, border: 'none',
                  background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                  color: '#ffffff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 15,
                  boxShadow: '0 14px 36px rgba(37,211,102,0.30)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
              >
                <MessageCircle size={18} strokeWidth={2.6} />
                Enquire on WhatsApp
                <span style={{
                  padding: '3px 9px', borderRadius: 9999,
                  background: 'rgba(255,255,255,0.18)',
                  fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em',
                }}>30 seconds</span>
              </button>

              {hotel.description && (
                <p style={{ fontSize: 13.5, color: '#414942', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: '0 0 22px' }}>
                  {hotel.description}
                </p>
              )}

              {/* Contact rows, every icon is an inline SVG (lucide), so ad blockers can't hide them */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { Icon: Phone,    label: 'Phone',         value: hotel.phone || '-', href: hotel.phone ? `tel:${hotel.phone.replace(/\s+/g, '')}` : undefined },
                  { Icon: Mail,     label: 'Email',         value: hotel.email || '-', href: hotel.email ? `mailto:${hotel.email}` : undefined },
                  { Icon: MapPin,   label: 'Address',       value: hotel.address || hotel.locationLabel, href: mapsUrl(hotel.name, hotel.address, hotel.locationLabel), action: 'Open in Maps' },
                  { Icon: Globe,    label: 'Website',       value: hotel.website || '-', href: hotel.website ? (hotel.website.startsWith('http') ? hotel.website : `https://${hotel.website}`) : undefined },
                  { Icon: Clock,    label: 'Rates Updated', value: fmtDate(hotel.updatedAt) },
                  { Icon: BedDouble, label: 'Available Now', value: `${availInv} rooms · ${availTypes + limitTypes}/${hotel.rooms.length} types open` },
                ].map(({ Icon, label, value, href, action }, i, arr) => {
                  const inner = (
                    <>
                      <div style={{
                        width: 40, height: 40, borderRadius: 9999, background: '#f3f4f5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#00361a',
                      }}>
                        <Icon size={17} strokeWidth={2} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717971', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {label}
                          {href && action && (
                            <span style={{
                              fontSize: 8.5, fontWeight: 800, letterSpacing: '0.08em',
                              color: '#13677b', background: 'rgba(19,103,123,0.10)',
                              padding: '2px 7px', borderRadius: 9999,
                            }}>{action}</span>
                          )}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: href ? '#00361a' : '#191c1d', marginTop: 3, fontFamily: 'Inter, sans-serif', overflowWrap: 'anywhere', textDecoration: href ? 'underline' : 'none', textDecorationColor: 'rgba(0,54,26,0.25)', textUnderlineOffset: 3 }}>{value}</div>
                      </div>
                    </>
                  )
                  const rowStyle: React.CSSProperties = {
                    display: 'grid', gridTemplateColumns: '44px 1fr',
                    alignItems: 'center', gap: 14,
                    padding: '11px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid #edeeef' : 'none',
                  }
                  return href ? (
                    <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ ...rowStyle, textDecoration: 'none', color: 'inherit' }}>
                      {inner}
                    </a>
                  ) : (
                    <div key={label} style={rowStyle}>{inner}</div>
                  )
                })}
              </div>

              {hotel.amenities?.length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717971', fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>
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
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717971', fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>
                    All Rates (per night, ₹)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 0.9fr 0.7fr', gap: 4, fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
                    {['Room', 'Double', 'CNB', 'X-Bed', 'Avail.'].map((h, i) => (
                      <div key={h} style={{ fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#717971', textAlign: i > 0 ? 'right' : 'left', paddingBottom: 6, borderBottom: '1px solid #edeeef' }}>{h}</div>
                    ))}
                    {hotel.rooms.map(r => (
                      <div key={r.id} style={{ display: 'contents' }}>
                        <div style={{ padding: '8px 0', fontWeight: 600, color: '#191c1d', borderBottom: '1px solid #f3f4f5' }}>
                          {r.type}
                          <div style={{ fontSize: 10, color: '#717971', fontWeight: 500 }}>{r.category} · {r.meal}</div>
                        </div>
                        <div style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#00361a', borderBottom: '1px solid #f3f4f5' }}>{fmtINR(r.double)}</div>
                        <div style={{ padding: '8px 0', textAlign: 'right', color: '#414942', borderBottom: '1px solid #f3f4f5' }}>{r.cnb ? fmtINR(r.cnb) : '-'}</div>
                        <div style={{ padding: '8px 0', textAlign: 'right', color: '#414942', borderBottom: '1px solid #f3f4f5' }}>{r.extraBed ? fmtINR(r.extraBed) : '-'}</div>
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

      {showWa && (
        <EnquireWhatsAppModal hotel={hotel} onClose={() => setShowWa(false)} />
      )}
    </>
  )
}

/** Build a Google Maps search URL from the hotel name + address. */
function mapsUrl(name: string, address: string, locationLabel: string): string {
  const q = [name, address, locationLabel].filter(Boolean).join(' ').trim()
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

/** Format YYYY-MM-DD → 'Mar 26' style; range → 'Mar 26 → Jun 26'. */
function shortRange(start: string, end: string): string {
  const fmt = (s: string) => {
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return s
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]
    return `${m} ${String(d.getFullYear()).slice(2)}`
  }
  return `${fmt(start)} → ${fmt(end)}`
}
