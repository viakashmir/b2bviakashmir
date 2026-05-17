'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Location, PropertyType, StarCategory, MealPlan, RoomCategory, GstStatus,
  LOCATIONS, LOCATION_LABELS, STAR_LABELS,
  amenitiesFor, categoriesFor,
} from '@/lib/data'
import {
  ArrowRight, ArrowLeft, Check, Building2, Sailboat, MapPin,
  Sparkles, Mountain, Wifi, Plus, Trash2, Calendar,
} from 'lucide-react'
import BrandedDatePicker from '@/components/BrandedDatePicker'

type RoomDraft = {
  type: string
  category: RoomCategory
  meal: MealPlan
  ep: string; cp: string; map: string; ap: string
  childWob: string; extraBed: string
  inventory: string
  gst: GstStatus
  notes: string
}
function blankRoom(forPropertyType: PropertyType): RoomDraft {
  return {
    type: '', category: forPropertyType === 'houseboat' ? 'Houseboat Deluxe' : 'Deluxe',
    meal: 'CP', ep: '', cp: '', map: '', ap: '',
    childWob: '', extraBed: '', inventory: '',
    gst: 'as_applicable', notes: '',
  }
}

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
  tariffStart: string
  tariffEnd: string
  rooms: RoomDraft[]
}

// Lean flow: every step that doesn't directly feed the rate sheet has
// been dropped. Description + amenities now live on the dashboard
// Profile tab so vendors can fill them in their own time.
//
// The 'rates' step is the centerpiece — tariff window + 1-3 room types
// with full meal-plan pricing on ONE screen.
const ALL_STEPS = [
  { key: 'name'         },
  { key: 'location'     },
  { key: 'propertyType', srinagarOnly: true },
  { key: 'stars'        },
  { key: 'address'      },
  { key: 'contact'      },
  { key: 'rates'        }, // tariff window + at least 1 room with at least 1 meal-plan rate
  { key: 'review'       },
] as const

export default function OnboardingFlow({ defaultEmail, onComplete }: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [data, setData] = useState<FormData>({
    name: '', location: '', propertyType: '', address: '', stars: 0,
    phone: '', email: defaultEmail || '', website: '', totalRooms: '',
    description: '', amenities: [],
    tariffStart: '', tariffEnd: '',
    rooms: [],
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
      case 'contact':      {
        const digits = data.phone.replace(/\D/g, '')
        return digits.length < 10 || digits.length > 15 ? 'Phone must be 10–15 digits.' : null
      }
      case 'rates': {
        if (!data.tariffStart || !data.tariffEnd) return 'Pick when your tariff is valid from – till.'
        if (data.tariffEnd < data.tariffStart)    return 'Tariff end date must be on or after the start date.'
        const filledRooms = data.rooms.filter(r => r.type.trim())
        if (filledRooms.length === 0) return 'Add at least one room type with a price — this is what agents will see.'
        for (const r of filledRooms) {
          const hasAnyRate = [r.ep, r.cp, r.map, r.ap].some(x => parseInt(x) > 0)
          if (!hasAnyRate) return `Room "${r.type}" needs at least one meal-plan rate (EP/CP/MAP/AP).`
        }
        return null
      }
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
      // Phone normalised to digits-only (preserving leading + if user typed one)
      const phoneDigits = data.phone.startsWith('+')
        ? '+' + data.phone.slice(1).replace(/\D/g, '')
        : data.phone.replace(/\D/g, '')

      const roomsPayload = data.rooms
        .filter(r => r.type.trim())
        .map(r => ({
          type: r.type.trim(), category: r.category, meal: r.meal,
          ep: r.ep, cp: r.cp, map: r.map, ap: r.ap,
          childWob: r.childWob, extraBed: r.extraBed,
          gst: r.gst, notes: r.notes.trim(),
          inventory: r.inventory, status: 'Available',
        }))

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
          phone: phoneDigits,
          email: data.email.trim(),
          website: data.website.trim(),
          description: data.description.trim(),
          amenities: data.amenities,
          tariffStart: data.tariffStart || null,
          tariffEnd:   data.tariffEnd   || null,
          rooms: roomsPayload,
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
            <Prompt title="What's your property called?" subtitle="The name travel agents will see on the rates board.">
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
            <Prompt title="How can agents reach you?" subtitle="Phone goes onto the public card. Email + website appear on Enquire.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <LabeledField label="Phone — digits only">
                  <TextField
                    refEl={inputRef as React.MutableRefObject<HTMLInputElement>}
                    type="tel"
                    inputMode="numeric"
                    value={data.phone}
                    onChange={v => {
                      // Allow leading + and digits only
                      const cleaned = v.startsWith('+')
                        ? '+' + v.slice(1).replace(/\D/g, '')
                        : v.replace(/\D/g, '')
                      update('phone', cleaned)
                    }}
                    placeholder="9194245678901"
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

          {step.key === 'rates' && (
            <Prompt
              title="Your rates"
              subtitle="The headline reason you're here — what agents pay. Add 1–3 room types with meal-plan rates. You can polish description, amenities & more rooms from the dashboard later."
            >
              {/* Tariff window — context for the rates */}
              <div style={{
                padding: 18, borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(255,220,196,0.30), rgba(184,240,197,0.26))',
                border: '1px solid rgba(240,159,94,0.22)',
                marginBottom: 22,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: '#6f3800', marginBottom: 10,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Calendar size={11} strokeWidth={2.5} />
                  These rates apply from — to
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <BrandedDatePicker
                    label="Valid from"
                    value={data.tariffStart}
                    min={new Date().toISOString().slice(0, 10)}
                    max={data.tariffEnd || undefined}
                    onChange={v => update('tariffStart', v)}
                    placeholder="Pick start date"
                  />
                  <BrandedDatePicker
                    label="Valid till"
                    value={data.tariffEnd}
                    min={data.tariffStart || new Date().toISOString().slice(0, 10)}
                    onChange={v => update('tariffEnd', v)}
                    placeholder="Pick end date"
                  />
                </div>
              </div>

              {/* Room cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.rooms.length === 0 && (
                  <div style={{
                    background: 'rgba(255,255,255,0.7)',
                    border: '2px dashed rgba(0,54,26,0.22)',
                    borderRadius: 16, padding: '24px 22px',
                    fontFamily: 'Inter, sans-serif', color: '#414942', fontSize: 13.5,
                    textAlign: 'center', lineHeight: 1.55,
                  }}>
                    <strong style={{ color: '#00361a' }}>Tap below to add your first room.</strong>
                    <div style={{ marginTop: 4, color: '#717971', fontSize: 12.5 }}>
                      Without at least one room with a price, agents won&apos;t see anything.
                    </div>
                  </div>
                )}

                {data.rooms.map((r, idx) => (
                  <RoomDraftCard
                    key={idx}
                    index={idx}
                    room={r}
                    propertyType={(data.propertyType || 'hotel') as PropertyType}
                    onChange={(patch) => {
                      setData(d => {
                        const next = [...d.rooms]
                        next[idx] = { ...next[idx], ...patch }
                        return { ...d, rooms: next }
                      })
                    }}
                    onRemove={() => setData(d => ({ ...d, rooms: d.rooms.filter((_, i) => i !== idx) }))}
                  />
                ))}

                {data.rooms.length < 3 && (
                  <button
                    type="button"
                    onClick={() => setData(d => ({ ...d, rooms: [...d.rooms, blankRoom((d.propertyType || 'hotel') as PropertyType)] }))}
                    style={{
                      padding: '16px 18px', borderRadius: 14, border: '2px dashed rgba(0,54,26,0.25)',
                      background: 'transparent', color: '#00361a',
                      fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,54,26,0.05)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    {data.rooms.length === 0 ? 'Add Your First Room' : 'Add Another Room Type'}
                    {data.rooms.length > 0 && <span style={{ opacity: 0.55, fontSize: 12 }}>({data.rooms.length}/3)</span>}
                  </button>
                )}
              </div>
            </Prompt>
          )}

          {step.key === 'review' && (
            <Prompt title="Ready to publish your listing?" subtitle="Looks right? Hit Publish — your listing goes live after admin approval.">
              <div style={{ background: '#ffffff', borderRadius: 18, padding: 24, boxShadow: '0 12px 40px rgba(0,54,26,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px 18px', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                  <ReviewRow label="Name"     value={data.name} />
                  <ReviewRow label="Type"     value={data.propertyType === 'houseboat' ? 'Houseboat' : 'Hotel'} />
                  <ReviewRow label="Location" value={data.location ? LOCATION_LABELS[data.location as Location] : ''} />
                  <ReviewRow label="Star"     value={data.stars ? STAR_LABELS[data.stars] : ''} />
                  <ReviewRow label="Address"  value={data.address} />
                  <ReviewRow label="Phone"    value={data.phone} />
                  <ReviewRow label="Email"    value={data.email} />
                  {data.website && <ReviewRow label="Website" value={data.website} />}
                  <ReviewRow label="Tariff period" value={data.tariffStart && data.tariffEnd ? `${data.tariffStart} → ${data.tariffEnd}` : '—'} />
                  <ReviewRow label="Room types"   value={data.rooms.length ? `${data.rooms.length} added` : '—'} />
                </div>
                {data.rooms.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #edeeef' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717971', marginBottom: 8 }}>
                      Rates summary
                    </div>
                    {data.rooms.map((r, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#414942', lineHeight: 1.5 }}>
                        <strong style={{ color: '#191c1d' }}>{r.type}</strong> · {r.category} · {r.inventory || 0} rooms
                        {' · '}
                        {[
                          r.ep && `EP ₹${r.ep}`,
                          r.cp && `CP ₹${r.cp}`,
                          r.map && `MAP ₹${r.map}`,
                          r.ap && `AP ₹${r.ap}`,
                        ].filter(Boolean).join(' · ')}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p style={{ marginTop: 14, fontSize: 12.5, color: '#717971', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                Add a description, amenities and more room types from your dashboard.
                Listing goes live the moment admin approves.
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

function TextField({ refEl, type = 'text', inputMode, value, onChange, onSubmit, placeholder }: {
  refEl?: React.MutableRefObject<HTMLInputElement>
  type?: string
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search'
  value: string; onChange: (v: string) => void
  onSubmit?: () => void; placeholder?: string
}) {
  return (
    <input
      ref={refEl}
      type={type}
      inputMode={inputMode}
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

const tfInput: React.CSSProperties = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid rgba(0,54,26,0.14)',
  borderRadius: 10,
  fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
  color: '#191c1d', padding: '11px 14px', outline: 'none',
}

const GST_OPTIONS: { key: GstStatus; label: string }[] = [
  { key: 'as_applicable',     label: 'GST As Applicable' },
  { key: 'included',          label: 'GST Included' },
  { key: 'extra',             label: 'GST Extra' },
  { key: 'non_commissionable',label: 'Net Non-Commissionable' },
]

const MEAL_OPTIONS: { key: MealPlan; label: string }[] = [
  { key: 'EP',  label: 'EP — Room Only' },
  { key: 'CP',  label: 'CP — Breakfast' },
  { key: 'MAP', label: 'MAP — Breakfast & Dinner' },
  { key: 'AP',  label: 'AP — All Meals' },
]

function RoomDraftCard({
  index, room, propertyType, onChange, onRemove,
}: {
  index: number
  room: RoomDraft
  propertyType: PropertyType
  onChange: (patch: Partial<RoomDraft>) => void
  onRemove: () => void
}) {
  const cats = categoriesFor(propertyType)
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(0,54,26,0.08)',
      borderRadius: 20,
      padding: 0,
      boxShadow: '0 8px 32px rgba(0,54,26,0.06)',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Header strip */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 22px',
        background: 'linear-gradient(135deg, rgba(0,54,26,0.05), rgba(184,240,197,0.18))',
        borderBottom: '1px solid rgba(0,54,26,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 9999,
            background: 'linear-gradient(135deg, #00361a, #1a4d2e)',
            color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 900, boxShadow: '0 4px 10px rgba(0,54,26,0.2)',
          }}>{index + 1}</span>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color: '#00361a', letterSpacing: '-0.01em' }}>
            Room Type {index + 1}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove room"
          style={{
            padding: '7px 12px', borderRadius: 9999, border: 'none',
            background: 'transparent', color: '#717971',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700,
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(186,26,26,0.08)'; (e.currentTarget as HTMLElement).style.color = '#ba1a1a' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#717971' }}
        >
          <Trash2 size={12} strokeWidth={2.3} /> Remove
        </button>
      </div>

      <div style={{ padding: 24 }}>
        {/* Basics */}
        <SectionLabel>Basics</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr', gap: 14, marginBottom: 22 }}>
          <Field label="Room name">
            <input value={room.type} onChange={e => onChange({ type: e.target.value })} placeholder="e.g. Deluxe Double" style={tfInput} />
          </Field>
          <Field label="Category">
            <select value={room.category} onChange={e => onChange({ category: e.target.value as RoomCategory })} style={tfInput}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Inventory">
            <Stepper value={room.inventory} onChange={v => onChange({ inventory: v })} min={0} max={500} />
          </Field>
        </div>

        {/* Rates */}
        <SectionLabel>Meal-plan rates (₹ per night)</SectionLabel>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14,
          marginBottom: 22,
        }}>
          {([
            { key: 'ep'  as const, code: 'EP',  text: 'Room Only',         tip: 'No meals included' },
            { key: 'cp'  as const, code: 'CP',  text: 'Breakfast',         tip: 'Breakfast only' },
            { key: 'map' as const, code: 'MAP', text: 'Breakfast + Dinner', tip: 'Two meals' },
            { key: 'ap'  as const, code: 'AP',  text: 'All meals',         tip: 'Breakfast, lunch & dinner' },
          ]).map(plan => (
            <RatePill
              key={plan.key}
              code={plan.code}
              label={plan.text}
              hint={plan.tip}
              value={(room as Record<string, string | unknown>)[plan.key as string] as string}
              onChange={v => onChange({ [plan.key]: v } as Partial<RoomDraft>)}
            />
          ))}
        </div>

        {/* Extras */}
        <SectionLabel>Extras &amp; surcharges</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.6fr', gap: 14, marginBottom: 22 }}>
          <Field label="Extra Bed (₹)">
            <Stepper value={room.extraBed} onChange={v => onChange({ extraBed: v })} step={100} max={20000} />
          </Field>
          <Field label="Child WOB (₹)">
            <Stepper value={room.childWob} onChange={v => onChange({ childWob: v })} step={100} max={20000} />
          </Field>
          <Field label="GST treatment">
            <select value={room.gst} onChange={e => onChange({ gst: e.target.value as GstStatus })} style={tfInput}>
              {GST_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </Field>
        </div>

        {/* Defaults */}
        <SectionLabel>Display defaults</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
          <Field label="Headline meal plan" hint="Shown as the big rate on the public card">
            <select value={room.meal} onChange={e => onChange({ meal: e.target.value as MealPlan })} style={tfInput}>
              {MEAL_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Notes (optional)">
            <input value={room.notes} onChange={e => onChange({ notes: e.target.value })} placeholder="e.g. Max 3 Pax · Net B2B" style={tfInput} />
          </Field>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '0.16em',
      textTransform: 'uppercase', color: '#1a4d2e',
      marginBottom: 12,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: 9999, background: '#1a4d2e' }} />
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 11, fontWeight: 700, color: '#414942',
        marginBottom: 7, fontFamily: 'Inter, sans-serif',
      }}>{label}</label>
      {children}
      {hint && <div style={{ marginTop: 5, fontSize: 10.5, color: '#9aa19f' }}>{hint}</div>}
    </div>
  )
}

/** Rate-plan pill with code badge + amount stepper inside. */
function RatePill({ code, label, hint, value, onChange }: {
  code: string; label: string; hint: string
  value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '52px 1fr',
      gap: 12,
      padding: 12,
      borderRadius: 14,
      border: '1px solid rgba(0,54,26,0.08)',
      background: '#fbfdfc',
      alignItems: 'center',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: 'linear-gradient(135deg, #00361a, #1a4d2e)',
        color: '#ffdcc4',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Manrope, sans-serif',
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1 }}>{code}</div>
        <div style={{ fontSize: 7.5, fontWeight: 700, marginTop: 3, opacity: 0.85, letterSpacing: '0.06em' }}>RATE</div>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#191c1d' }}>{label}</span>
          <span style={{ fontSize: 10, color: '#9aa19f' }}>{hint}</span>
        </div>
        <Stepper value={value} onChange={onChange} step={100} max={500000} prefix="₹" />
      </div>
    </div>
  )
}

/** Numeric stepper with –/+ buttons (replaces browser default spinners). */
function Stepper({ value, onChange, min = 0, max = 999999, step = 1, prefix }: {
  value: string; onChange: (v: string) => void
  min?: number; max?: number; step?: number; prefix?: string
}) {
  const n = parseInt(value || '0') || 0
  const setN = (v: number) => onChange(String(Math.max(min, Math.min(max, v))))
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      borderRadius: 10, overflow: 'hidden',
      border: '1px solid rgba(0,54,26,0.14)',
      background: '#ffffff',
    }}>
      <button
        type="button"
        onClick={() => setN(n - step)}
        aria-label="decrease"
        style={stepperBtn}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f3f4f5' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff' }}
      >−</button>
      <div style={{ flex: 1, position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: '#9aa19f', fontWeight: 600, fontFamily: 'Inter, sans-serif', fontSize: 13,
            pointerEvents: 'none',
          }}>{prefix}</span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
          placeholder="0"
          style={{
            width: '100%', border: 'none', outline: 'none', background: 'transparent',
            padding: prefix ? '11px 12px 11px 22px' : '11px 12px',
            fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#191c1d',
            textAlign: 'center',
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => setN(n + step)}
        aria-label="increase"
        style={stepperBtn}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f3f4f5' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff' }}
      >+</button>
    </div>
  )
}

const stepperBtn: React.CSSProperties = {
  width: 36, border: 'none', background: '#ffffff', cursor: 'pointer',
  fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18,
  color: '#00361a',
  transition: 'background 0.15s',
  borderLeft: '1px solid rgba(0,54,26,0.08)',
  borderRight: '1px solid rgba(0,54,26,0.08)',
}

/** Tariff date range with min=today, branded native date inputs, and a day-count badge. */
function TariffWindow({ start, end, onStart, onEnd }: {
  start: string; end: string
  onStart: (v: string) => void
  onEnd: (v: string) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  // duration calc
  let nights = 0
  if (start && end && end >= start) {
    const s = new Date(start), e = new Date(end)
    nights = Math.round((e.getTime() - s.getTime()) / 86400000) + 1
  }
  const months = nights >= 30 ? Math.round((nights / 30) * 10) / 10 : 0

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <BrandedDatePicker label="Valid from" value={start} min={today} max={end || undefined} onChange={onStart} placeholder="Pick start date" />
        <BrandedDatePicker label="Valid till" value={end}   min={start || today}                 onChange={onEnd}   placeholder="Pick end date" />
      </div>
      <div style={{
        marginTop: 18,
        padding: '14px 18px',
        borderRadius: 12,
        background: nights > 0
          ? 'linear-gradient(135deg, rgba(184,240,197,0.35), rgba(255,220,196,0.35))'
          : 'rgba(0,54,26,0.04)',
        border: '1px solid rgba(0,54,26,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        fontFamily: 'Inter, sans-serif',
      }}>
        <span style={{ fontSize: 13, color: '#414942', fontWeight: 600 }}>
          {nights > 0
            ? <>
                Validity: <strong style={{ color: '#00361a' }}>{nights} {nights === 1 ? 'day' : 'days'}</strong>
                {months > 0 && <span style={{ color: '#717971', fontWeight: 500 }}> · approx. {months} month{months !== 1 ? 's' : ''}</span>}
              </>
            : <span style={{ color: '#717971' }}>Pick a start and end date to see the validity window.</span>}
        </span>
        {nights > 0 && <ArrowRight size={14} strokeWidth={2.5} color="#1a4d2e" />}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: '#717971', fontFamily: 'Inter, sans-serif' }}>
        Example: <strong>15 Mar 2026 → 30 Jun 2026</strong> for the spring/summer season.
      </div>
    </div>
  )
}

function BrandedDateField({ label, value, min, max, onChange }: {
  label: string; value: string
  min?: string; max?: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 11, fontWeight: 700, color: '#414942',
        marginBottom: 7, fontFamily: 'Inter, sans-serif',
      }}>{label}</label>
      <div style={{
        position: 'relative',
        borderRadius: 12,
        border: '1px solid rgba(0,54,26,0.14)',
        background: '#ffffff',
        transition: 'border-color 0.18s, box-shadow 0.18s',
      }}>
        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%',
            border: 'none', outline: 'none', background: 'transparent',
            padding: '12px 14px',
            fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700,
            color: '#00361a',
          }}
          onFocus={e => {
            const wrap = e.currentTarget.parentElement as HTMLElement
            wrap.style.borderColor = '#00361a'
            wrap.style.boxShadow = '0 0 0 4px rgba(0,54,26,0.08)'
          }}
          onBlur={e => {
            const wrap = e.currentTarget.parentElement as HTMLElement
            wrap.style.borderColor = 'rgba(0,54,26,0.14)'
            wrap.style.boxShadow = 'none'
          }}
        />
      </div>
    </div>
  )
}

const tfLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 9.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: '#717971', marginBottom: 5, fontFamily: 'Inter, sans-serif',
}
