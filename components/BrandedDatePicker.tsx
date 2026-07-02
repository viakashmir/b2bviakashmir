'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Props {
  /** YYYY-MM-DD or '' */
  value: string
  onChange: (v: string) => void
  /** YYYY-MM-DD lower bound (inclusive) */
  min?: string
  /** YYYY-MM-DD upper bound (inclusive) */
  max?: string
  placeholder?: string
  /** Inline label position relative to the trigger field */
  label?: string
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function pad(n: number) { return String(n).padStart(2, '0') }
function ymd(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function parseYmd(s: string): Date | null {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  const dt = new Date(y, m - 1, d)
  return Number.isNaN(dt.getTime()) ? null : dt
}
function fmtFullLabel(s: string): string {
  const d = parseYmd(s); if (!d) return ''
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BrandedDatePicker({ value, onChange, min, max, placeholder = 'Select a date', label }: Props) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const initial = parseYmd(value) || parseYmd(min || '') || new Date()
  const [viewYear,  setViewYear]  = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth()) // 0..11
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Decide whether to open upward or downward based on available viewport space
  useEffect(() => {
    if (!open) return
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const POPOVER_HEIGHT = 420 // generous estimate; safer than under-estimating
    const spaceBelow = window.innerHeight - rect.bottom
    setOpenUp(spaceBelow < POPOVER_HEIGHT && rect.top > POPOVER_HEIGHT)
  }, [open])

  // Keep the calendar view aligned with the picked value when opening
  useEffect(() => {
    if (!open) return
    const v = parseYmd(value)
    if (v) { setViewYear(v.getFullYear()); setViewMonth(v.getMonth()) }
  }, [open, value])

  // Click outside closes
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  const minD = parseYmd(min || '')
  const maxD = parseYmd(max || '')
  const todayStr = ymd(new Date())

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Calendar grid: pad leading days to align with Monday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay() // 0 Sun..6 Sat
  const pad_ = (firstWeekday + 6) % 7

  const cells: Array<{ d: number; iso: string; isPast: boolean; outOfRange: boolean } | null> = []
  for (let i = 0; i < pad_; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`
    const isPast = !!minD && iso < ymd(minD)
    const outAfter = !!maxD && iso > ymd(maxD)
    cells.push({ d, iso, isPast: isPast || outAfter, outOfRange: outAfter })
  }
  // Fill trailing so total is a multiple of 7
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      {label && (
        <label style={{
          display: 'block', fontSize: 11, fontWeight: 700, color: '#414942',
          marginBottom: 7, fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif',
        }}>{label}</label>
      )}
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10, padding: '12px 14px',
          background: '#ffffff',
          border: `1px solid ${open ? '#00361a' : 'rgba(0,54,26,0.14)'}`,
          borderRadius: 12,
          fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 14, fontWeight: 700,
          color: value ? '#00361a' : '#9aa19f',
          cursor: 'pointer',
          boxShadow: open ? '0 0 0 4px rgba(0,54,26,0.08)' : 'none',
          transition: 'box-shadow 0.18s, border-color 0.18s',
          textAlign: 'left',
        }}
      >
        <span>{value ? fmtFullLabel(value) : placeholder}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#717971' }}>
          {value && (
            <span
              role="button"
              aria-label="Clear"
              onClick={e => { e.stopPropagation(); onChange('') }}
              style={{ width: 22, height: 22, borderRadius: 9999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#717971' }}
            >
              <X size={12} strokeWidth={2.5} />
            </span>
          )}
          <Calendar size={15} strokeWidth={2.2} />
        </span>
      </button>

      {/* Popover calendar */}
      {open && (
        <div
          role="dialog"
          aria-label="Pick a date"
          style={{
            position: 'absolute', zIndex: 350,
            ...(openUp
              ? { bottom: 'calc(100% + 8px)' }
              : { top: 'calc(100% + 8px)' }),
            left: 0,
            width: 320, maxWidth: '92vw',
            background: '#ffffff',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,54,26,0.18), 0 4px 16px rgba(25,28,29,0.08)',
            border: '1px solid rgba(0,54,26,0.08)',
            overflow: 'hidden',
            fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)',
            color: '#ffffff',
          }}>
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9dd3aa' }}>
                Pick a date
              </div>
              <div style={{ fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontSize: 17, fontWeight: 800, marginTop: 2, letterSpacing: '-0.01em' }}>
                {MONTHS[viewMonth]} {viewYear}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                style={navBtnStyle}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                style={navBtnStyle}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
              >
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Weekday header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px 12px 4px' }}>
            {WEEKDAYS.map(w => (
              <div key={w} style={{
                fontSize: 9.5, fontWeight: 800, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#9aa19f', textAlign: 'center', padding: 4,
              }}>{w}</div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px 12px', gap: 2 }}>
            {cells.map((c, i) => {
              if (!c) return <div key={`pad-${i}`} />
              const isSelected = c.iso === value
              const isToday = c.iso === todayStr
              const disabled = c.isPast
              return (
                <button
                  key={c.iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => { onChange(c.iso); setOpen(false) }}
                  style={{
                    height: 36, width: '100%',
                    border: 'none', borderRadius: 9,
                    background: isSelected
                      ? 'linear-gradient(135deg, #00361a, #1a4d2e)'
                      : isToday
                        ? 'rgba(255,220,196,0.45)'
                        : 'transparent',
                    color: isSelected
                      ? '#ffffff'
                      : disabled
                        ? '#c1c9bf'
                        : isToday
                          ? '#6f3800'
                          : '#191c1d',
                    fontFamily: isSelected || isToday ? '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif' : '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif',
                    fontWeight: isSelected ? 800 : isToday ? 800 : 600,
                    fontSize: 13,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'background 0.12s, transform 0.12s',
                    boxShadow: isSelected ? '0 6px 14px rgba(0,54,26,0.22)' : undefined,
                  }}
                  onMouseEnter={e => {
                    if (disabled || isSelected) return
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(0,54,26,0.06)'
                  }}
                  onMouseLeave={e => {
                    if (disabled || isSelected) return
                    ;(e.currentTarget as HTMLElement).style.background = isToday ? 'rgba(255,220,196,0.45)' : 'transparent'
                  }}
                >
                  {c.d}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 16px', borderTop: '1px solid #edeeef', background: '#fbfdfc',
          }}>
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontWeight: 700, fontSize: 12, color: '#717971',
                padding: '6px 10px', borderRadius: 8,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f3f4f5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const t = new Date()
                const iso = ymd(t)
                // Respect min, if today is before min, jump to min instead
                const target = minD && iso < ymd(minD) ? ymd(minD) : iso
                onChange(target); setOpen(false)
              }}
              style={{
                padding: '8px 14px', borderRadius: 9999,
                background: 'linear-gradient(135deg, #00361a, #1a4d2e)',
                color: '#ffffff', border: 'none', cursor: 'pointer',
                fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif', fontWeight: 800, fontSize: 12,
                display: 'inline-flex', alignItems: 'center', gap: 5,
                boxShadow: '0 4px 12px rgba(0,54,26,0.22)',
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 9999, border: 'none',
  background: 'rgba(255,255,255,0.08)', color: '#ffffff', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.15s',
}
