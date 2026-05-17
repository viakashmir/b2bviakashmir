'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Location, PropertyType, StarCategory,
  LOCATIONS, LOCATION_LABELS, STAR_LABELS,
  amenitiesFor,
} from '@/lib/data'
import {
  ArrowRight, ArrowLeft, Check, Building2, Sailboat, MapPin,
  Sparkles, Mountain, Wifi, ChevronDown,
} from 'lucide-react'

interface Props {
  defaultName: string
  defaultEmail: string
  onComplete: () => void
}

type FormData = {
  name: string
  location: Location | ''
  propertyType: PropertyType | ''
  address: string
  stars: StarCategory | 0
  phone: string
  email: string
  website: string
  totalRooms: string
  description: string
  amenities: string[]
}

const ALL_STEPS = [
  { key: 'name',         num:  1 },
  { key: 'location',     num:  2 },
  { key: 'propertyType', num:  3, srinagarOnly: true },
  { key: 'stars',        num:  4 },
  { key: 'address',      num:  5 },
  { key: 'contact',      num:  6 },
  { key: 'rooms',        num:  7 },
  { key: 'description',  num:  8 },
  { key: 'amenities',    num:  9 },
  { key: 'review',       num: 10 },
] as const

export default function OnboardingFlow({ defaultEmail, onComplete }: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [data, setData] = useState<FormData>({
    name: '', location: '', propertyType: '', address: '', stars: 0,
    phone: '', email: defaultEmail || '', website: '', totalRooms: '',
    description: '', amenities: [],
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  const STEPS = ALL_STEPS.filter(s => !('srinagarOnly' in s && s.srinagarOnly) || data.location === 'srinagar')
  const step = STEPS[Math.min(stepIdx, STEPS.length - 1)]
  const totalSteps = STEPS.length
  const stepNum = stepIdx + 1
  const isLast = stepIdx >= STEPS.length - 1
  const progress = (stepNum / totalSteps) * 100

  useEffect(() => {
    setError('')
    setTimeout(() => inputRef.current?.focus(), 200)
  }, [stepIdx])

  useEffect(() => {
    if (data.location && data.location !== 'srinagar' && data.propertyType !== 'hotel') {
      setData(d => ({ ...d, propertyType: 'hotel' }))
    }
  }, [data.location, data.propertyType])

  useEffect(() => {
    const valid = new Set(amenitiesFor(data.propertyType === 'houseboat' ? 'houseboat' : 'hotel'))
    setData(d => ({ ...d, amenities: d.amenities.filter(a => valid.has(a)) }))
  }, [data.propertyType])

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData(d => ({ ...d, [k]: v }))

  const toggleAmenity = (a: string) =>
    setData(d => ({ ...d, amenities: d.amenities.includes(a) ? d.amenities.filter(x => x !== a) : [...d.amenities, a] }))

  const validateStep = (): string | null => {
    switch (step.key) {
      case 'name':         return data.name.trim().length < 3 ? 'Property name is required.' : null
      case 'location':     return !data.location ? 'Pick a location.' : null
      case 'propertyType': return !data.propertyType ? 'Pick whether this is a hotel or a houseboat.' : null
      case 'stars':        return !data.stars ? 'Select your star category.' : null
      case 'address':      return data.address.trim().length < 6 ? 'Please enter a full address.' : null
      case 'contact':      return !/^[+\d][\d\s\-()]{6,}$/.test(data.phone) ? 'Enter a valid phone number.' : null
      case 'rooms':        return !data.totalRooms || parseInt(data.totalRooms) <= 0 ? 'Total rooms must be a positive number.' : null
      case 'description':  return data.description.trim().length < 20 ? 'Tell guests a bit more — at least a sentence (20+ chars).' : null
      default: return null
    }
  }

  const next = () => {
    const v = validateStep()
    if (v) { setError(v); return }
    if (isLast) { submit(); return }
    setDirection('forward')
    setStepIdx(i => Math.min(i + 1, STEPS.length - 1))
  }
  const back = () => { setDirection('back'); setStepIdx(i => Math.max(i - 1, 0)) }

  const submit = async () => {
    setSubmitting(true); setError('')
    try {
      const propertyType = data.propertyType || 'hotel'
      const res = await fetch('/api/hotels/me', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          stars: data.stars || 3,
          location: data.location,
          locationLabel: LOCATION_LABELS[data.location as Location],
          propertyType,
          address: data.address.trim(),
          phone: data.phone.trim(),
          email: data.email.trim(),
          website: data.website.trim(),
          description: data.description.trim(),
          amenities: data.amenities,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      onComplete()
    } catch (e) {
      setError(`Couldn't save: ${(e as Error).message}`)
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(160deg, #f8f9fa 0%, #e7f3ec 60%, #d5e8dc 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
      zIndex: 200,
    }}>
      {/* Progress bar — full width, top */}
      <div style={{ height: 4, background: 'rgba(0,54,26,0.08)', position: 'relative' }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, #1a4d2e, #00361a)',
          transition: 'width 0.45s cubic-bezier(0.65, 0, 0.35, 1)',
        }} />
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 36px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#00361a' }}>
          <Mountain size={20} strokeWidth={2.3} />
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>
            Via Kashmir
          </span>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#717971', padding: '4px 10px', borderRadius: 9999,
            background: 'rgba(0,54,26,0.06)',
          }}>
            List your property
          </span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#414942' }}>
          {stepNum} <span style={{ color: '#9dd3aa' }}>of</span> {totalSteps}
        </div>
      </div>

      {/* Centered content */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 24px 80px',
      }}>
        <div
          key={step.key}
          style={{
            width: '100%', maxWidth: 640,
            animation: direction === 'forward'
              ? 'tf-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) both'
              : 'tf-in-back 0.4s cubic-bezier(0.4, 0, 0.2, 1) both',
          }}
        >
          {/* Step number indicator */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18,
            fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#1a4d2e',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: 9999,
              background: 'linear-gradient(135deg, #00361a, #1a4d2e)',
              color: '#ffffff', fontSize: 10, fontWeight: 900,
            }}>
              {stepNum}
            </span>
            <ArrowRight size={11} strokeWidth={2.5} color="#9dd3aa" />
            Step {stepNum}
          </div>

          {/* === STEPS === */}
          {step.key === 'name' && (
            <Prompt title="What's your property called?" subtitle="The name agents and guests will see on the rates board.">
              <TextField
                refEl={inputRef as React.MutableRefObject<HTMLInputElement>}
                value={data.name}
                onChange={v => update('name', v)}
                onSubmit={next}
                placeholder="e.g. Grand Palace Hotel · Dal View Houseboats"
              />
            </Prompt>
          )}

          {step.key === 'location' && (
            <Prompt title="Where is your property?" subtitle="Pick the closest region — agents filter by this.">
              <ChoiceGrid
                options={LOCATIONS.filter(l => l.value !== 'all').map(l => ({
                  key: l.value as string, label: l.label, Icon: MapPin,
                }))}
                value={data.location}
                onChange={v => { update('location', v as Location); setTimeout(next, 220) }}
              />
            </Prompt>
          )}

          {step.key === 'propertyType' && (
            <Prompt title="Hotel or Houseboat?" subtitle="Both are common in Srinagar — pick one.">
              <ChoiceGrid
                cols={2}
                options={[
                  { key: 'hotel',     label: 'Hotel',     blurb: 'Land-based property',          Icon: Building2 },
                  { key: 'houseboat', label: 'Houseboat', blurb: 'On the Dal or Nigeen lake',    Icon: Sailboat },
                ]}
                value={data.propertyType}
                onChange={v => { update('propertyType', v as PropertyType); setTimeout(next, 220) }}
                big
              />
            </Prompt>
          )}

          {step.key === 'stars' && (
            <Prompt title="What's your star category?" subtitle="Pick the closest match — you can update this later.">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                {[1, 2, 3, 4, 5].map(n => {
                  const active = data.stars === n
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => { update('stars', n as StarCategory); setTimeout(next, 220) }}
                      style={{
                        padding: '22px 12px', borderRadius: 14, border: '2px solid',
                        borderColor: active ? '#00361a' : 'rgba(0,54,26,0.12)',
                        background: active ? 'linear-gradient(135deg, #00361a, #1a4d2e)' : '#ffffff',
                        color: active ? '#ffffff' : '#191c1d',
                        fontFamily: 'Manrope, sans-serif', fontWeight: 800,
                        cursor: 'pointer', transition: 'all 0.18s',
                        boxShadow: active ? '0 10px 24px rgba(0,54,26,0.22)' : '0 1px 3px rgba(25,28,29,0.04)',
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                        <Sparkles size={16} strokeWidth={2.5} color={active ? '#ffdcc4' : '#f09f5e'} />
                      </div>
                      <div style={{ fontSize: 26, lineHeight: 1, letterSpacing: '-0.02em' }}>{n}</div>
                      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6, opacity: active ? 0.9 : 0.6 }}>
                        {n === 5 ? 'Deluxe' : 'Star'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Prompt>
          )}

          {step.key === 'address' && (
            <Prompt title="What's the full address?" subtitle="Street, area, PIN code — what a driver would need.">
              <Textarea
                refEl={inputRef as React.MutableRefObject<HTMLTextAreaElement>}
                value={data.address}
                onChange={v => update('address', v)}
                placeholder="e.g. Residency Road, Srinagar 190001"
                rows={3}
              />
            </Prompt>
          )}

          {step.key === 'contact' && (
            <Prompt title="How can agents reach you?" subtitle="Phone goes onto the public card. Email + website are shown on Enquire.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <LabeledField label="Phone">
                  <TextField
                    refEl={inputRef as React.MutableRefObject<HTMLInputElement>}
                    type="tel"
                    value={data.phone}
                    onChange={v => update('phone', v)}
                    placeholder="+91 194 245 6789"
                  />
                </LabeledField>
                <LabeledField label="Email">
                  <TextField
                    type="email"
                    value={data.email}
                    onChange={v => update('email', v)}
                    placeholder="reservations@yourhotel.com"
                  />
                </LabeledField>
                <LabeledField label="Website (optional)">
                  <TextField
                    type="url"
                    value={data.website}
                    onChange={v => update('website', v)}
                    placeholder="www.yourhotel.com"
                  />
                </LabeledField>
              </div>
            </Prompt>
          )}

          {step.key === 'rooms' && (
            <Prompt title="How many rooms in total?" subtitle="A round number is fine — you'll add room types and rates next.">
              <BigNumberInput
                refEl={inputRef as React.MutableRefObject<HTMLInputElement>}
                value={data.totalRooms}
                onChange={v => update('totalRooms', v)}
                onSubmit={next}
                placeholder="24"
              />
            </Prompt>
          )}

          {step.key === 'description' && (
            <Prompt title="A line about your property" subtitle="One or two sentences — what makes you stand out?">
              <Textarea
                refEl={inputRef as React.MutableRefObject<HTMLTextAreaElement>}
                value={data.description}
                onChange={v => update('description', v)}
                placeholder="Heritage property on the Dal Lake with cedar-wood interiors and panoramic mountain views."
                rows={4}
                showCounter
              />
            </Prompt>
          )}

          {step.key === 'amenities' && (
            <Prompt title="Which amenities do you offer?" subtitle={`Tap to toggle — ${data.propertyType === 'houseboat' ? 'houseboat-specific' : 'hotel'} amenities.`}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {amenitiesFor(data.propertyType === 'houseboat' ? 'houseboat' : 'hotel').map(a => {
                  const active = data.amenities.includes(a)
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      style={{
                        padding: '10px 16px', borderRadius: 9999, border: '2px solid',
                        borderColor: active ? '#00361a' : 'rgba(0,54,26,0.12)',
                        background: active ? '#00361a' : '#ffffff',
                        color: active ? '#ffffff' : '#414942',
                        fontFamily: 'Inter, sans-serif', fontSize: 13.5, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.18s',
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                      }}
                    >
                      {active ? <Check size={13} strokeWidth={3} /> : <Wifi size={12} strokeWidth={2.2} opacity={0.6} />}
                      {a}
                    </button>
                  )
                })}
              </div>
            </Prompt>
          )}

          {step.key === 'review' && (
            <Prompt title="Ready to publish your listing?" subtitle="Looks right? Hit Publish — your listing goes live after admin approval.">
              <div style={{ background: '#ffffff', borderRadius: 18, padding: 24, boxShadow: '0 12px 40px rgba(0,54,26,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 18px', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                  <ReviewRow label="Name"     value={data.name} />
                  <ReviewRow label="Type"     value={data.propertyType === 'houseboat' ? 'Houseboat' : 'Hotel'} />
                  <ReviewRow label="Location" value={data.location ? LOCATION_LABELS[data.location as Location] : ''} />
                  <ReviewRow label="Star"     value={data.stars ? STAR_LABELS[data.stars] : ''} />
                  <ReviewRow label="Address"  value={data.address} />
                  <ReviewRow label="Phone"    value={data.phone} />
                  <ReviewRow label="Email"    value={data.email} />
                  {data.website && <ReviewRow label="Website" value={data.website} />}
                  <ReviewRow label="Rooms"    value={data.totalRooms} />
                  <ReviewRow label="Amenities" value={data.amenities.length ? data.amenities.join(', ') : '—'} />
                </div>
              </div>
              <p style={{ marginTop: 14, fontSize: 12.5, color: '#717971', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                You can change anything from your dashboard after publishing.
              </p>
            </Prompt>
          )}

          {/* Error */}
          {error && (
            <p style={{
              marginTop: 18, fontSize: 13, color: '#93000a', fontWeight: 600,
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: '#93000a' }} />
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 36px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(248,249,250,0.85)',
        backdropFilter: 'blur(14px)',
        borderTop: '1px solid rgba(0,54,26,0.06)',
      }}>
        <button
          type="button"
          onClick={back}
          disabled={stepIdx === 0}
          style={{
            background: 'transparent', border: 'none', cursor: stepIdx === 0 ? 'default' : 'pointer',
            color: stepIdx === 0 ? '#c1c9bf' : '#414942',
            fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13,
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 12px',
          }}
        >
          <ArrowLeft size={14} strokeWidth={2.3} /> Back
        </button>
        <div style={{ fontSize: 11, color: '#717971', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          Press <kbd style={kbd}>Enter ↵</kbd> to continue
        </div>
        <button
          type="button"
          onClick={next}
          disabled={submitting}
          style={{
            padding: '12px 22px', borderRadius: 9999, border: 'none',
            background: 'linear-gradient(135deg, #00361a, #1a4d2e)',
            color: '#ffffff', cursor: 'pointer',
            fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 14,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 8px 24px rgba(0,54,26,0.25)',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {isLast
            ? (submitting ? 'Publishing…' : (<><Check size={15} strokeWidth={2.5} /> Publish</>))
            : (<>OK <ArrowRight size={15} strokeWidth={2.5} /></>)}
        </button>
      </div>

      <style>{`
        @keyframes tf-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tf-in-back {
          from { opacity: 0; transform: translateY(-24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

/* ====== Composables ====== */

function Prompt({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{
        fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(28px, 4vw, 38px)',
        fontWeight: 800, color: '#00361a', letterSpacing: '-0.025em', lineHeight: 1.12,
        margin: 0,
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 16, color: '#414942', margin: '12px 0 28px', lineHeight: 1.5, fontWeight: 500 }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  )
}

function TextField({ refEl, type = 'text', value, onChange, onSubmit, placeholder }: {
  refEl?: React.MutableRefObject<HTMLInputElement>
  type?: string; value: string; onChange: (v: string) => void
  onSubmit?: () => void; placeholder?: string
}) {
  return (
    <input
      ref={refEl}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter' && onSubmit) { e.preventDefault(); onSubmit() } }}
      placeholder={placeholder}
      style={{
        width: '100%',
        background: 'transparent',
        border: 'none', borderBottom: '2px solid rgba(0,54,26,0.18)',
        fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 600,
        color: '#00361a', padding: '10px 0', outline: 'none',
        transition: 'border-color 0.2s',
      }}
      onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderBottomColor = '#00361a' }}
      onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderBottomColor = 'rgba(0,54,26,0.18)' }}
    />
  )
}

function BigNumberInput({ refEl, value, onChange, onSubmit, placeholder }: {
  refEl?: React.MutableRefObject<HTMLInputElement>
  value: string; onChange: (v: string) => void
  onSubmit?: () => void; placeholder?: string
}) {
  return (
    <input
      ref={refEl}
      type="number"
      min={1}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter' && onSubmit) { e.preventDefault(); onSubmit() } }}
      placeholder={placeholder}
      style={{
        width: '100%',
        background: 'transparent',
        border: 'none', borderBottom: '2px solid rgba(0,54,26,0.18)',
        fontFamily: 'Manrope, sans-serif', fontSize: 60, fontWeight: 800,
        color: '#00361a', padding: '8px 0', outline: 'none', letterSpacing: '-0.02em',
        textAlign: 'left',
      }}
      onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderBottomColor = '#00361a' }}
      onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderBottomColor = 'rgba(0,54,26,0.18)' }}
    />
  )
}

function Textarea({ refEl, value, onChange, placeholder, rows = 3, showCounter }: {
  refEl?: React.MutableRefObject<HTMLTextAreaElement>
  value: string; onChange: (v: string) => void
  placeholder?: string; rows?: number; showCounter?: boolean
}) {
  return (
    <>
      <textarea
        ref={refEl}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'transparent',
          border: 'none', borderBottom: '2px solid rgba(0,54,26,0.18)',
          fontFamily: 'Inter, sans-serif', fontSize: 19, fontWeight: 500,
          color: '#00361a', padding: '10px 0', outline: 'none',
          resize: 'vertical', lineHeight: 1.5,
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderBottomColor = '#00361a' }}
        onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderBottomColor = 'rgba(0,54,26,0.18)' }}
      />
      {showCounter && (
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: value.length >= 20 ? '#1d5031' : '#717971' }}>
          {value.length} characters
        </div>
      )}
    </>
  )
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717971', marginBottom: 4 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function ChoiceGrid({ options, value, onChange, cols = 0, big = false }: {
  options: Array<{ key: string; label: string; blurb?: string; Icon?: typeof MapPin }>
  value: string
  onChange: (v: string) => void
  cols?: number
  big?: boolean
}) {
  const gridCols = cols ? `repeat(${cols}, 1fr)` : 'repeat(auto-fill, minmax(180px, 1fr))'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12 }}>
      {options.map(o => {
        const active = value === o.key
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            style={{
              padding: big ? '22px 18px' : '16px 18px',
              borderRadius: 14, border: '2px solid',
              borderColor: active ? '#00361a' : 'rgba(0,54,26,0.12)',
              background: active ? 'linear-gradient(135deg, #00361a, #1a4d2e)' : '#ffffff',
              color: active ? '#ffffff' : '#191c1d',
              fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              transition: 'all 0.18s', textAlign: 'left',
              boxShadow: active ? '0 10px 24px rgba(0,54,26,0.22)' : '0 1px 3px rgba(25,28,29,0.04)',
              display: 'flex', alignItems: big ? 'flex-start' : 'center', gap: 10,
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          >
            {o.Icon && <o.Icon size={big ? 22 : 16} strokeWidth={2.3} color={active ? '#b8f0c5' : '#00361a'} />}
            <div>
              <div style={{ fontFamily: big ? 'Manrope, sans-serif' : 'Inter, sans-serif', fontSize: big ? 17 : 14, fontWeight: big ? 800 : 700 }}>
                {o.label}
              </div>
              {o.blurb && (
                <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4, opacity: active ? 0.85 : 0.65 }}>
                  {o.blurb}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717971', paddingTop: 4 }}>
        {label}
      </div>
      <div style={{ color: '#191c1d', fontWeight: 600, wordBreak: 'break-word' }}>{value || '—'}</div>
    </>
  )
}

const kbd: React.CSSProperties = {
  display: 'inline-block', padding: '3px 8px', background: '#ffffff',
  border: '1px solid rgba(0,54,26,0.15)',
  borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif',
  color: '#414942',
}
