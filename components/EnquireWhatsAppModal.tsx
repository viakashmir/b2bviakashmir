'use client'

import { useState } from 'react'
import {
  X, MessageCircle, ArrowRight, ArrowLeft, CalendarDays, Users, BedDouble, Check,
} from 'lucide-react'
import BrandedDatePicker from '@/components/BrandedDatePicker'
import { Hotel } from '@/lib/data'

interface Props {
  hotel: Hotel
  onClose: () => void
}

type Step = 'dates' | 'party' | 'contact' | 'done'

export default function EnquireWhatsAppModal({ hotel, onClose }: Props) {
  const [step, setStep] = useState<Step>('dates')
  const [checkIn, setCheckIn]   = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [rooms, setRooms]       = useState(1)
  const [adults, setAdults]     = useState(2)
  const [children, setChildren] = useState(0)
  const [notes, setNotes]       = useState('')
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [waLink, setWaLink]     = useState('')
  const [error, setError]       = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const nights = (() => {
    if (!checkIn || !checkOut) return 0
    return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
  })()

  const next = () => {
    setError('')
    if (step === 'dates') {
      // Dates are optional, allow skip — but if one is set, require both
      if ((checkIn && !checkOut) || (checkOut && !checkIn)) {
        setError('Pick both check-in and check-out, or leave both blank.')
        return
      }
      if (checkIn && checkOut && checkOut <= checkIn) {
        setError('Check-out must be after check-in.')
        return
      }
      setStep('party')
    } else if (step === 'party') {
      if (rooms < 1 || adults < 1) {
        setError('At least 1 room and 1 adult.')
        return
      }
      setStep('contact')
    } else if (step === 'contact') {
      void submit()
    }
  }

  const back = () => {
    setError('')
    if (step === 'party') setStep('dates')
    else if (step === 'contact') setStep('party')
    else if (step === 'done')    setStep('contact')
  }

  const submit = async () => {
    setError('')
    if (name.trim().length < 2) { setError('Please enter your name.'); return }
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Please enter a valid phone number (10+ digits).'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          hotelId: hotel.id,
          travellerName: name.trim(),
          travellerPhone: phone.trim(),
          checkIn: checkIn || null,
          checkOut: checkOut || null,
          rooms, adults, children,
          notes: notes.trim(),
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'Could not send enquiry')
      setWaLink(j.whatsappLink)
      setStep('done')
      // Auto-open WhatsApp in a new tab
      window.open(j.whatsappLink, '_blank', 'noopener')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,54,26,0.62)', zIndex: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        backdropFilter: 'blur(6px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%', maxWidth: 520, background: '#ffffff',
          borderRadius: 22, overflow: 'hidden', maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 80px rgba(0,54,26,0.30)',
          animation: 'fade-up 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
          padding: '20px 24px', color: '#ffffff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, fontWeight: 800, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.92)',
              background: 'rgba(255,255,255,0.16)',
              padding: '4px 10px', borderRadius: 9999, marginBottom: 10,
            }}>
              <MessageCircle size={11} strokeWidth={2.6} /> WhatsApp Enquiry
            </div>
            <h3 style={{
              fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800,
              margin: 0, letterSpacing: '-0.01em',
            }}>
              {step === 'done' ? 'Opening WhatsApp…' : `Quick enquiry · ${hotel.name}`}
            </h3>
            <div style={{ fontSize: 12, opacity: 0.86, marginTop: 4 }}>
              {step === 'done' ? 'The hotel & admin have been notified.' : 'Takes 30 seconds. We pre-fill the message.'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.18)', border: 'none', color: '#ffffff',
              cursor: 'pointer', width: 32, height: 32, borderRadius: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Close"
          ><X size={16} strokeWidth={2.5} /></button>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div style={{
            padding: '12px 24px', background: '#f8faf9',
            borderBottom: '1px solid #edeeef',
            display: 'flex', gap: 6, alignItems: 'center',
            fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#717971',
            letterSpacing: '0.04em',
          }}>
            <StepDot active={step === 'dates'}   done={['party','contact'].includes(step)} label="Dates"   />
            <ChevronSep />
            <StepDot active={step === 'party'}   done={['contact'].includes(step)}         label="Rooms & guests" />
            <ChevronSep />
            <StepDot active={step === 'contact'} done={false}                              label="You"     />
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: '#ffdad6', color: '#93000a',
              fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600,
              marginBottom: 14,
            }}>{error}</div>
          )}

          {step === 'dates' && (
            <>
              <SectionTitle Icon={CalendarDays} title="When are you travelling?" hint="Tip: leave blank if your dates are flexible — the hotel will quote you anyway." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <BrandedDatePicker label="Check-in"  value={checkIn}  min={today} max={checkOut || undefined} onChange={setCheckIn}  placeholder="Pick date" />
                <BrandedDatePicker label="Check-out" value={checkOut} min={checkIn || today}                 onChange={setCheckOut} placeholder="Pick date" />
              </div>
              {nights > 0 && (
                <div style={{
                  marginTop: 12, padding: '8px 14px', borderRadius: 9999,
                  background: 'rgba(184,240,197,0.30)', color: '#00361a',
                  fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <Check size={12} strokeWidth={3} /> {nights} night{nights === 1 ? '' : 's'} · we'll mention this in the message
                </div>
              )}
            </>
          )}

          {step === 'party' && (
            <>
              <SectionTitle Icon={Users} title="Who's coming?" hint="The hotel uses this to recommend the right room category." />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <CounterField label="Rooms"     Icon={BedDouble} value={rooms}    min={1} max={20} onChange={setRooms}    />
                <CounterField label="Adults"    Icon={Users}     value={adults}   min={1} max={30} onChange={setAdults}   />
                <CounterField label="Children"  Icon={Users}     value={children} min={0} max={30} onChange={setChildren} />
              </div>
              <div style={{ marginTop: 18 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700, color: '#414942',
                  marginBottom: 7, fontFamily: 'Inter, sans-serif',
                }}>Anything specific? <span style={{ color: '#9aa19f', fontWeight: 500 }}>(optional)</span></label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value.slice(0, 500))}
                  placeholder="e.g. need an extra bed, ground floor preferred, late check-in around 11pm…"
                  rows={3}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 12,
                    border: '1px solid rgba(0,54,26,0.14)', fontFamily: 'Inter, sans-serif',
                    fontSize: 13.5, color: '#191c1d', resize: 'vertical',
                  }}
                />
              </div>
            </>
          )}

          {step === 'contact' && (
            <>
              <SectionTitle Icon={MessageCircle} title="Who shall we say is asking?" hint="Goes into the message so the hotel can address you by name." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FieldWrap label="Your full name">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Anaya Sharma" autoFocus style={fieldStyle} />
                </FieldWrap>
                <FieldWrap label="Your phone — for the hotel to reach you">
                  <input
                    value={phone}
                    type="tel"
                    inputMode="numeric"
                    onChange={e => {
                      const cleaned = e.target.value.startsWith('+')
                        ? '+' + e.target.value.slice(1).replace(/\D/g, '')
                        : e.target.value.replace(/\D/g, '')
                      setPhone(cleaned)
                    }}
                    placeholder="+91 9876543210"
                    style={fieldStyle}
                  />
                </FieldWrap>
              </div>
              <div style={{
                marginTop: 16, padding: 14, borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(184,240,197,0.30), rgba(255,220,196,0.18))',
                fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#414942', lineHeight: 1.5,
              }}>
                Hitting <strong>Send via WhatsApp</strong> opens WhatsApp with a pre-filled message — you just tap send. We log this enquiry so the Via Kashmir team can follow up if the hotel doesn't reply within 24h.
              </div>
            </>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '30px 8px' }}>
              <div style={{
                width: 72, height: 72, margin: '0 auto 18px', borderRadius: 9999,
                background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 14px 40px rgba(37,211,102,0.40)',
              }}>
                <Check size={32} strokeWidth={3} />
              </div>
              <h4 style={{
                fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800,
                color: '#00361a', margin: '0 0 8px',
              }}>Your enquiry was sent</h4>
              <p style={{ fontSize: 13, color: '#414942', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: '0 auto 18px', maxWidth: 360 }}>
                WhatsApp should have opened in a new tab. If it didn't, tap the button below.
              </p>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 22px', borderRadius: 9999, textDecoration: 'none',
                    background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                    color: '#ffffff', fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 13.5,
                    boxShadow: '0 10px 30px rgba(37,211,102,0.36)',
                  }}
                ><MessageCircle size={14} strokeWidth={2.6} /> Open WhatsApp again</a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'done' && (
          <div style={{
            padding: '14px 24px', borderTop: '1px solid #edeeef',
            background: '#fafbfa',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
          }}>
            <button
              onClick={back}
              disabled={step === 'dates'}
              style={{
                padding: '10px 16px', borderRadius: 9999, border: 'none',
                background: 'transparent', color: step === 'dates' ? '#c1c9bf' : '#414942',
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
                cursor: step === 'dates' ? 'default' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <ArrowLeft size={14} strokeWidth={2.4} /> Back
            </button>
            <button
              onClick={next}
              disabled={submitting}
              style={{
                padding: '12px 22px', borderRadius: 9999, border: 'none',
                background: submitting
                  ? '#9aa19f'
                  : 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                color: '#ffffff', fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 13.5,
                cursor: submitting ? 'wait' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 7,
                boxShadow: '0 8px 24px rgba(37,211,102,0.30)',
              }}
            >
              {step === 'contact'
                ? (submitting ? 'Sending…' : 'Send via WhatsApp')
                : 'Continue'}
              <ArrowRight size={14} strokeWidth={2.6} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// =========== Small helpers ===========

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: '1px solid rgba(0,54,26,0.14)',
  fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 600, color: '#191c1d',
}

function FieldWrap({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700, color: '#414942',
        marginBottom: 6, fontFamily: 'Inter, sans-serif',
      }}>{label}</label>
      {children}
    </div>
  )
}

function SectionTitle({ Icon, title, hint }: { Icon: typeof CalendarDays; title: string; hint?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h4 style={{
        fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800,
        color: '#00361a', margin: 0, display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        <Icon size={18} strokeWidth={2.3} color="#1a5128" />
        {title}
      </h4>
      {hint && <div style={{ fontSize: 12.5, color: '#717971', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{hint}</div>}
    </div>
  )
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  const fill = done ? '#1a5128' : active ? '#00361a' : '#c1c9bf'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 16, height: 16, borderRadius: 9999, background: fill,
        color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 900,
      }}>{done ? '✓' : ''}</span>
      <span style={{ color: active || done ? '#00361a' : '#9aa19f' }}>{label}</span>
    </span>
  )
}

function ChevronSep() {
  return <span style={{ color: '#c1c9bf', fontSize: 12 }}>›</span>
}

function CounterField({ label, Icon, value, onChange, min = 0, max = 99 }: {
  label: string; Icon: typeof Users; value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  return (
    <div>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 700, color: '#414942',
        marginBottom: 7, fontFamily: 'Inter, sans-serif',
      }}><Icon size={11} strokeWidth={2.3} /> {label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
        padding: '6px 10px', borderRadius: 12,
        border: '1px solid rgba(0,54,26,0.14)', background: '#ffffff',
      }}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          style={{
            width: 28, height: 28, borderRadius: 9999, border: 'none',
            background: value <= min ? '#edeeef' : '#f3f4f5', color: value <= min ? '#c1c9bf' : '#00361a',
            cursor: value <= min ? 'default' : 'pointer', fontSize: 16, fontWeight: 800,
          }}
        >−</button>
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#00361a', minWidth: 18, textAlign: 'center' }}>{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          style={{
            width: 28, height: 28, borderRadius: 9999, border: 'none',
            background: value >= max ? '#edeeef' : '#f3f4f5', color: value >= max ? '#c1c9bf' : '#00361a',
            cursor: value >= max ? 'default' : 'pointer', fontSize: 16, fontWeight: 800,
          }}
        >+</button>
      </div>
    </div>
  )
}
