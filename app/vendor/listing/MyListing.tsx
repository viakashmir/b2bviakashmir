'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Building2, MapPin, Phone, Mail, Globe, BedDouble, Clock,
  CheckCircle2, Eye, ExternalLink, AlertTriangle, Pencil,
} from 'lucide-react'
import HotelCard from '@/components/HotelCard'
import { Hotel, STAR_LABELS } from '@/lib/data'
import { browserSupabase } from '@/lib/supabase'

export default function MyListing() {
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/hotels/me', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      setHotel(json.hotel)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    refresh()
    let sb: ReturnType<typeof browserSupabase> | null = null
    try { sb = browserSupabase() } catch {}
    if (!sb) return
    const channel = sb.channel('vendor-my-listing')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hotels' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms'  }, refresh)
      .subscribe()
    return () => { sb!.removeChannel(channel) }
  }, [refresh])

  if (loading) {
    return (
      <main>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 700, color: '#00361a', opacity: 0.5 }}>Loading your listing…</div>
        </div>
      </main>
    )
  }

  if (!hotel) {
    return (
      <main>
        <div className="card-elevated" style={{ padding: 48, textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <Building2 size={48} color="#c1c9bf" style={{ display: 'block', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#00361a', margin: '0 0 10px' }}>
            No listing yet
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#414942', lineHeight: 1.55, margin: '0 0 24px' }}>
            Finish the onboarding to create your listing.
          </p>
          <Link href="/vendor" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '12px 22px', fontSize: 13 }}>
              Start onboarding
            </button>
          </Link>
        </div>
      </main>
    )
  }

  const availInv = hotel.rooms.filter(r => r.status === 'Available').reduce((a, r) => a + (r.inventory || 0), 0)
  const totalInv = hotel.rooms.reduce((a, r) => a + (r.inventory || 0), 0)

  return (
    <main>
      <div className="dash-header">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>
            <Building2 size={11} strokeWidth={2.5} /> My Listing
          </span>
          <h1 className="dash-title">{hotel.name}</h1>
          <p style={{ fontSize: 14, color: '#414942', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            {STAR_LABELS[hotel.stars]} · {hotel.propertyType === 'houseboat' ? 'Houseboat' : 'Hotel'} · {hotel.locationLabel}
          </p>
        </div>
        <div className="dash-actions">
          {hotel.approved
            ? (
              <a href="/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
                  <ExternalLink size={13} strokeWidth={2.3} /> Open Public Page
                </button>
              </a>
            )
            : (
              <span className="badge badge-tertiary" style={{ padding: '8px 14px', fontSize: 11 }}>
                <Clock size={11} strokeWidth={2.5} /> Pending admin approval
              </span>
            )}
          <Link href="/vendor" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ padding: '10px 18px', fontSize: 13 }}>
              <Pencil size={13} strokeWidth={2.3} /> Edit / Add Rooms
            </button>
          </Link>
        </div>
      </div>

      {/* Banner if not approved or no rooms */}
      {(!hotel.approved || hotel.rooms.length === 0) && (
        <div style={{
          background: '#fff8ed', border: '1px solid #ffdcc4',
          borderRadius: 14, padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#6f3800',
        }}>
          <AlertTriangle size={18} strokeWidth={2.3} color="#f09f5e" />
          <div>
            {!hotel.approved && (
              <div><strong>Waiting for admin approval.</strong> Your listing won&apos;t appear on the public rate board until an admin approves it.</div>
            )}
            {hotel.rooms.length === 0 && (
              <div style={{ marginTop: hotel.approved ? 0 : 6 }}>
                <strong>No room types yet.</strong> Add at least one room from the dashboard so agents can see your rates.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live snapshot stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Room types',     value: String(hotel.rooms.length),    sub: hotel.rooms.length ? 'Configured' : 'Add some below', Icon: BedDouble,     accent: '#13677b' },
          { label: 'Total inventory',value: String(totalInv),               sub: 'Across all room types',                              Icon: Building2,     accent: '#00361a' },
          { label: 'Available now',  value: String(availInv),               sub: 'Marked Available',                                   Icon: CheckCircle2,  accent: '#1d5031' },
          { label: 'Status',         value: hotel.approved ? 'Live' : 'Pending', sub: hotel.approved ? 'On public board' : 'Awaiting approval', Icon: Eye, accent: hotel.approved ? '#1d5031' : '#f09f5e', small: true },
        ].map((c, i) => (
          <div key={i} className="card-elevated" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="t-overline">{c.label}</div>
              <div style={{ width: 36, height: 36, borderRadius: 9999, background: '#f3f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.Icon size={16} strokeWidth={2.2} color={c.accent} />
              </div>
            </div>
            <div className={`stat-value${c.small ? ' small' : ''}`} style={{ color: c.accent }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#717971', marginTop: 8, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-column: hotel info + public preview card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }} className="my-listing-grid">
        {/* Details panel */}
        <div className="card-elevated" style={{ padding: 24 }}>
          <div className="t-overline" style={{ marginBottom: 16 }}>Property details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { Icon: Building2, label: 'Property type',  value: `${STAR_LABELS[hotel.stars]} · ${hotel.propertyType === 'houseboat' ? 'Houseboat' : 'Hotel'}` },
              { Icon: MapPin,    label: 'Location',       value: hotel.locationLabel },
              { Icon: MapPin,    label: 'Address',        value: hotel.address || '—' },
              { Icon: Phone,     label: 'Phone',          value: hotel.phone || '—' },
              { Icon: Mail,      label: 'Email',          value: hotel.email || '—' },
              { Icon: Globe,     label: 'Website',        value: hotel.website || '—' },
            ].map(row => (
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9999, background: '#f3f4f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00361a',
                }}>
                  <row.Icon size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="t-overline" style={{ marginBottom: 2 }}>{row.label}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#191c1d', overflowWrap: 'anywhere' }}>
                    {row.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hotel.description && (
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #edeeef' }}>
              <div className="t-overline" style={{ marginBottom: 8 }}>About</div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#414942', lineHeight: 1.6, margin: 0 }}>
                {hotel.description}
              </p>
            </div>
          )}

          {hotel.amenities?.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #edeeef' }}>
              <div className="t-overline" style={{ marginBottom: 10 }}>Amenities</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {hotel.amenities.map(a => (
                  <span key={a} className="badge badge-neutral" style={{ fontSize: 10 }}>{a}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #edeeef' }}>
            <Link href="/vendor" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ padding: '10px 18px', fontSize: 12.5, width: '100%', justifyContent: 'center' }}>
                <Pencil size={13} strokeWidth={2.3} /> Edit details on dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* Public preview using HotelCard */}
        <div>
          <div className="t-overline" style={{ marginBottom: 10, padding: '0 4px' }}>
            <Eye size={11} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Public preview — what agents see
          </div>
          {hotel.approved ? (
            <HotelCard hotel={hotel} index={0} />
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ filter: 'grayscale(0.4)', opacity: 0.78, pointerEvents: 'none' }}>
                <HotelCard hotel={hotel} index={0} />
              </div>
              <div style={{
                position: 'absolute', top: 16, left: 16, right: 16,
                background: 'rgba(0,54,26,0.92)', color: '#ffdcc4',
                padding: '10px 14px', borderRadius: 10,
                fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 24px rgba(0,54,26,0.25)',
              }}>
                <Clock size={13} strokeWidth={2.5} />
                Hidden until admin approves
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .my-listing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}
