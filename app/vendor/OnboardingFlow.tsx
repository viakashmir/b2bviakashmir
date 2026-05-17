'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Location, PropertyType, StarCategory,
  LOCATIONS, LOCATION_LABELS, STAR_LABELS,
  amenitiesFor,
} from '@/lib/data'

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

// Step list — 'propertyType' is shown only when location === 'srinagar'
const ALL_STEPS = [
  { key: 'name',         label: 'Name' },
  { key: 'location',     label: 'Location' },
  { key: 'propertyType', label: 'Property Type', srinagarOnly: true },
  { key: 'stars',        label: 'Star Category' },
  { key: 'address',      label: 'Address' },
  { key: 'contact',      label: 'Contact' },
  { key: 'rooms',        label: 'Rooms' },
  { key: 'description',  label: 'About' },
  { key: 'amenities',    label: 'Amenities' },
  { key: 'review',       label: 'Review' },
] as const
type StepKey = (typeof ALL_STEPS)[number]['key']

export default function OnboardingFlow({ defaultName, defaultEmail, onComplete }: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [data, setData] = useState<FormData>({
    name: '', location: '', propertyType: '', address: '', stars: 0,
    phone: '', email: defaultEmail || '', website: '', totalRooms: '',
    description: '', amenities: [],
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  // Property-type step is conditional — only meaningful for Srinagar.
  const STEPS = ALL_STEPS.filter(s => !('srinagarOnly' in s && s.srinagarOnly) || data.location === 'srinagar')
  const step = STEPS[Math.min(stepIdx, STEPS.length - 1)]
  const isLast = stepIdx >= STEPS.length - 1
  const progress = ((stepIdx + 1) / STEPS.length) * 100

  // For non-Srinagar locations, hotels are the only property type — set it implicitly.
  useEffect(() => {
    if (data.location && data.location !== 'srinagar' && data.propertyType !== 'hotel') {
      setData(d => ({ ...d, propertyType: 'hotel' }))
    }
  }, [data.location, data.propertyType])

  // Reset amenity selection when switching property type — different lists.
  useEffect(() => {
    const valid = new Set(amenitiesFor(data.propertyType === 'houseboat' ? 'houseboat' : 'hotel'))
    setData(d => ({ ...d, amenities: d.amenities.filter(a => valid.has(a)) }))
  }, [data.propertyType])

  useEffect(() => {
    // Autofocus first input on step change
    setError('')
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [stepIdx])

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
      case 'description':  return data.description.trim().length < 20 ? 'Please add at least a sentence (20+ chars).' : null
      default: return null
    }
  }

  const next = () => {
    const v = validateStep()
    if (v) { setError(v); return }
    if (isLast) { submit(); return }
    setStepIdx(i => Math.min(i + 1, STEPS.length - 1))
  }
  const back = () => setStepIdx(i => Math.max(i - 1, 0))

  const submit = async () => {
    setSubmitting(true)
    setError('')
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
    <main style={{ minHeight: 'calc(100vh - 76px)', background: '#f8f9fa', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 620 }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00361a', fontFamily: 'Inter, sans-serif' }}>
              Step {stepIdx + 1} of {STEPS.length} · {step.label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#717971', fontFamily: 'Inter, sans-serif' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: 4, background: '#edeeef', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(135deg, #00361a, #1a4d2e)',
              transition: 'width 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </div>
        </div>

        <div className="card-elevated fade-up" key={step.key} style={{ padding: '40px 36px' }}>
          {/* Step body */}
          {step.key === 'name' && (
            <StepShell title="What's your property called?" hint="The name agents will see on the rates board.">
              <input
                ref={inputRef as React.MutableRefObject<HTMLInputElement>}
                type="text"
                className="input-field"
                placeholder="e.g. Grand Palace Hotel · Dal View Houseboats"
                value={data.name}
                onChange={e => update('name', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && next()}
                style={{ fontSize: 18, padding: '16px 18px' }}
              />
            </StepShell>
          )}

          {step.key === 'location' && (
            <StepShell title="Where is the property?" hint="Pick the closest region.">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {LOCATIONS.filter(l => l.value !== 'all').map(l => {
                  const active = data.location === l.value
                  return (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => { update('location', l.value as Location); setTimeout(next, 200) }}
                      style={{
                        padding: '16px 18px', borderRadius: 14, border: 'none',
                        background: active ? 'linear-gradient(135deg, #00361a, #1a4d2e)' : '#f3f4f5',
                        color: active ? '#ffffff' : '#191c1d',
                        fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.18s',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <i className="fi fi-rr-marker" style={{ fontSize: 14 }} />
                      {l.label}
                    </button>
                  )
                })}
              </div>
            </StepShell>
          )}

          {step.key === 'propertyType' && (
            <StepShell title="Hotel or Houseboat?" hint="In Srinagar both are common — pick one.">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {([
                  { key: 'hotel',     label: 'Hotel',     icon: 'fi-rr-building',  blurb: 'Land-based property' },
                  { key: 'houseboat', label: 'Houseboat', icon: 'fi-rr-sailboat',  blurb: 'On the Dal / Nigeen lake' },
                ] as { key: PropertyType; label: string; icon: string; blurb: string }[]).map(p => {
                  const active = data.propertyType === p.key
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => { update('propertyType', p.key); setTimeout(next, 200) }}
                      style={{
                        padding: '20px 18px', borderRadius: 16, border: 'none',
                        background: active ? 'linear-gradient(135deg, #00361a, #1a4d2e)' : '#f3f4f5',
                        color: active ? '#ffffff' : '#191c1d',
                        fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                        transition: 'all 0.18s', textAlign: 'left',
                      }}
                    >
                      <i className={`fi ${p.icon}`} style={{ fontSize: 22, display: 'block', marginBottom: 8, color: active ? '#b8f0c5' : '#00361a' }} />
                      <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>{p.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4, opacity: active ? 0.85 : 0.65 }}>{p.blurb}</div>
                    </button>
                  )
                })}
              </div>
            </StepShell>
          )}

          {step.key === 'stars' && (
            <StepShell title="Star category?" hint="Pick the closest match.">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[1, 2, 3, 4, 5].map(n => {
                  const active = data.stars === n
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => { update('stars', n as StarCategory); setTimeout(next, 200) }}
                      style={{
                        flex: '1 1 100px', minWidth: 100,
                        padding: '18px 14px', borderRadius: 14, border: 'none',
                        background: active ? 'linear-gradient(135deg, #00361a, #1a4d2e)' : '#f3f4f5',
                        color: active ? '#ffffff' : '#191c1d',
                        fontFamily: 'Manrope, sans-serif', fontWeight: 800,
                        cursor: 'pointer', transition: 'all 0.18s',
                      }}
                    >
                      <div style={{ fontSize: 22, lineHeight: 1 }}>{n}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4, opacity: active ? 0.85 : 0.7 }}>
                        {n === 5 ? 'Deluxe' : 'Star'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </StepShell>
          )}

          {step.key === 'address' && (
            <StepShell title="Full address?" hint="Street, area, PIN — what a driver would need.">
              <textarea
                ref={inputRef as React.MutableRefObject<HTMLTextAreaElement>}
                className="input-field"
                placeholder="e.g. Residency Road, Srinagar 190001"
                value={data.address}
                onChange={e => update('address', e.target.value)}
                rows={3}
                style={{ fontSize: 16, padding: '14px 16px', resize: 'vertical' }}
              />
            </StepShell>
          )}

          {step.key === 'contact' && (
            <StepShell title="How can agents reach you?" hint="The phone goes onto the public card.">
              <label style={onbLabel}>Phone</label>
              <input
                ref={inputRef as React.MutableRefObject<HTMLInputElement>}
                type="tel"
                className="input-field"
                placeholder="+91 194 245 6789"
                value={data.phone}
                onChange={e => update('phone', e.target.value)}
                style={{ fontSize: 16, padding: '14px 16px', marginBottom: 14 }}
              />
              <label style={onbLabel}>Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="reservations@yourhotel.com"
                value={data.email}
                onChange={e => update('email', e.target.value)}
                style={{ fontSize: 16, padding: '14px 16px', marginBottom: 14 }}
              />
              <label style={onbLabel}>Website (optional)</label>
              <input
                type="url"
                className="input-field"
                placeholder="www.yourhotel.com"
                value={data.website}
                onChange={e => update('website', e.target.value)}
                style={{ fontSize: 16, padding: '14px 16px' }}
              />
            </StepShell>
          )}

          {step.key === 'rooms' && (
            <StepShell title="How many rooms total?" hint="Don't worry — you'll add room types and rates after this.">
              <input
                ref={inputRef as React.MutableRefObject<HTMLInputElement>}
                type="number"
                min={1}
                className="input-field"
                placeholder="e.g. 24"
                value={data.totalRooms}
                onChange={e => update('totalRooms', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && next()}
                style={{ fontSize: 22, padding: '16px 18px' }}
              />
            </StepShell>
          )}

          {step.key === 'description' && (
            <StepShell title="A short description" hint="One or two sentences — what makes you stand out?">
              <textarea
                ref={inputRef as React.MutableRefObject<HTMLTextAreaElement>}
                className="input-field"
                placeholder="e.g. Heritage property on the Dal Lake with cedar-wood interiors and panoramic mountain views."
                value={data.description}
                onChange={e => update('description', e.target.value)}
                rows={4}
                style={{ fontSize: 15, padding: '14px 16px', resize: 'vertical', lineHeight: 1.5 }}
              />
              <div style={{ marginTop: 8, fontSize: 11, color: data.description.length >= 20 ? '#1d5031' : '#717971', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                {data.description.length} characters
              </div>
            </StepShell>
          )}

          {step.key === 'amenities' && (
            <StepShell title="Which amenities do you offer?" hint={`Tap to toggle — ${data.propertyType === 'houseboat' ? 'houseboat-specific' : 'hotel'} amenities only.`}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {amenitiesFor(data.propertyType === 'houseboat' ? 'houseboat' : 'hotel').map(a => {
                  const active = data.amenities.includes(a)
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      style={{
                        padding: '10px 16px', borderRadius: 9999, border: 'none',
                        background: active ? 'linear-gradient(135deg, #00361a, #1a4d2e)' : '#f3f4f5',
                        color: active ? '#ffffff' : '#414942',
                        fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.18s',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <i className={`fi ${active ? 'fi-rs-check-circle' : 'fi-rr-plus-small'}`} style={{ fontSize: 12 }} />
                      {a}
                    </button>
                  )
                })}
              </div>
            </StepShell>
          )}

          {step.key === 'review' && (
            <StepShell title="Ready to publish?" hint="You can edit everything later from your dashboard. Your listing goes live after admin approval.">
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 18px', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                <ReviewRow label="Name"        value={data.name} />
                <ReviewRow label="Type"        value={data.propertyType === 'houseboat' ? 'Houseboat' : 'Hotel'} />
                <ReviewRow label="Location"    value={data.location ? LOCATION_LABELS[data.location as Location] : ''} />
                <ReviewRow label="Star"        value={data.stars ? STAR_LABELS[data.stars] : ''} />
                <ReviewRow label="Address"     value={data.address} />
                <ReviewRow label="Phone"       value={data.phone} />
                <ReviewRow label="Email"       value={data.email} />
                {data.website && <ReviewRow label="Website" value={data.website} />}
                <ReviewRow label="Rooms"       value={data.totalRooms} />
                <ReviewRow label="Amenities"   value={data.amenities.length ? data.amenities.join(', ') : '—'} />
              </div>
              <div style={{ marginTop: 18, padding: 14, background: 'rgba(184,240,197,0.18)', borderRadius: 10, fontSize: 12, color: '#1d5031', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                <i className="fi fi-rr-shield-check" style={{ fontSize: 13, marginRight: 6, verticalAlign: 'middle' }} />
                Listing will be visible after admin approval. You can edit all of this anytime.
              </div>
            </StepShell>
          )}

          {error && (
            <p style={{ marginTop: 16, fontSize: 13, color: '#93000a', fontFamily: 'Inter, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fi fi-rs-exclamation" style={{ fontSize: 14 }} /> {error}
            </p>
          )}

          {/* Footer nav */}
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={back}
              disabled={stepIdx === 0}
              className="btn-ghost"
              style={{ padding: '10px 16px', fontSize: 13, opacity: stepIdx === 0 ? 0.4 : 1, cursor: stepIdx === 0 ? 'not-allowed' : 'pointer' }}
            >
              <i className="fi fi-rr-angle-small-left" style={{ fontSize: 14 }} /> Back
            </button>

            <button
              type="button"
              onClick={next}
              className="btn-primary"
              disabled={submitting}
              style={{ padding: '12px 22px', fontSize: 14 }}
            >
              {isLast ? (
                submitting ? (<><span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> Publishing…</>)
                          : (<><i className="fi fi-rs-check-circle" style={{ fontSize: 14 }} /> Publish &amp; Continue</>)
              ) : (
                <>Next <i className="fi fi-rr-angle-small-right" style={{ fontSize: 14 }} /></>
              )}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#717971', fontFamily: 'Inter, sans-serif' }}>
          Press <kbd style={kbd}>Enter</kbd> to continue · You can edit everything later
        </div>
      </div>
    </main>
  )
}

function StepShell({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#00361a', letterSpacing: '-0.025em', lineHeight: 1.15, margin: 0 }}>
        {title}
      </h2>
      {hint && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#717971', margin: '8px 0 24px', lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
      {children}
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

const onbLabel: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: '#414942', marginBottom: 8,
  fontFamily: 'Inter, sans-serif',
}

const kbd: React.CSSProperties = {
  display: 'inline-block', padding: '2px 6px', background: '#edeeef',
  borderRadius: 4, fontSize: 10, fontWeight: 700, fontFamily: 'Inter, monospace',
  color: '#414942',
}
