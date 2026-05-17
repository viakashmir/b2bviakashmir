'use client'

import { useEffect, useState } from 'react'
import { LOCATION_COORDS, LOCATION_LABELS, Location } from '@/lib/data'

interface CityWeather {
  key: Location
  label: string
  temp: number | null
  code: number | null
}

const CITY_ORDER: Location[] = ['srinagar', 'gulmarg', 'pahalgam', 'sonamarg', 'gurez']

/** Map WMO weather code (open-meteo) → Flaticon icon + short label */
function wmo(code: number | null): { icon: string; label: string; color: string } {
  if (code == null) return { icon: 'fi-rr-cloud',         label: '—',         color: '#9dd3aa' }
  if (code === 0)   return { icon: 'fi-rr-sun',           label: 'Clear',     color: '#ffdcc4' }
  if (code <= 3)    return { icon: 'fi-rr-cloud-sun',     label: 'Cloudy',    color: '#b8f0c5' }
  if (code <= 48)   return { icon: 'fi-rr-smog',          label: 'Foggy',     color: '#c1c9bf' }
  if (code <= 67)   return { icon: 'fi-rr-cloud-drizzle', label: 'Rain',      color: '#a1e7ff' }
  if (code <= 77)   return { icon: 'fi-rr-snowflake',     label: 'Snow',      color: '#ffffff' }
  if (code <= 82)   return { icon: 'fi-rr-cloud-showers', label: 'Showers',   color: '#a1e7ff' }
  if (code >= 95)   return { icon: 'fi-rr-cloud-storm',   label: 'Thunder',   color: '#b8f0c5' }
  return { icon: 'fi-rr-cloud', label: 'Cloudy', color: '#b8f0c5' }
}

export default function KashmirLive() {
  const [now, setNow] = useState<Date | null>(null)
  const [cities, setCities] = useState<CityWeather[]>(
    CITY_ORDER.map(k => ({ key: k, label: LOCATION_LABELS[k], temp: null, code: null }))
  )

  // Tick clock every second (after mount to avoid SSR mismatch)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Pull weather every 15 minutes
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const lat = CITY_ORDER.map(k => LOCATION_COORDS[k].lat).join(',')
        const lon = CITY_ORDER.map(k => LOCATION_COORDS[k].lon).join(',')
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia%2FKolkata`)
        if (!res.ok) return
        const data = await res.json()
        const arr = Array.isArray(data) ? data : [data]
        if (!alive) return
        setCities(
          CITY_ORDER.map((k, i) => ({
            key: k,
            label: LOCATION_LABELS[k],
            temp: Math.round(arr[i]?.current?.temperature_2m ?? Number.NaN),
            code: arr[i]?.current?.weather_code ?? null,
          })),
        )
      } catch { /* swallow — strip will just show — */ }
    }
    load()
    const t = setInterval(load, 15 * 60 * 1000)
    return () => { alive = false; clearInterval(t) }
  }, [])

  const time = now ? new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
  }).format(now) : '—'
  const date = now ? new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', weekday: 'short', day: '2-digit', month: 'short',
  }).format(now) : ''

  return (
    <section className="kashmir-live" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: 12,
      marginBottom: 28,
    }}>
      {/* Clock card */}
      <div className="card-elevated" style={{
        background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)',
        padding: '20px 24px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <i className="fi fi-rr-mountains" style={{
          position: 'absolute', right: -16, top: -10, fontSize: 110, color: 'rgba(184,240,197,0.08)', pointerEvents: 'none',
        }} />
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9dd3aa', fontFamily: 'Inter, sans-serif' }}>
          <i className="fi fi-rr-clock" style={{ fontSize: 11, marginRight: 6 }} />
          Kashmir Time · IST
        </div>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 6 }}>
          {time}
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
          {date}
        </div>
      </div>

      {/* Weather strip */}
      <div className="card-elevated" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#717971', fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>
          <i className="fi fi-rr-cloud-sun" style={{ fontSize: 11, marginRight: 6, color: '#13677b' }} />
          Live Weather
        </div>
        <div className="weather-row" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: 6,
        }}>
          {cities.map(c => {
            const w = wmo(c.code)
            return (
              <div key={c.key} style={{
                padding: '10px 8px',
                borderRadius: 12,
                background: '#f3f4f5',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4,
                fontFamily: 'Inter, sans-serif',
              }}>
                <i className={`fi ${w.icon}`} style={{ fontSize: 18, color: '#00361a' }} />
                <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: '#00361a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {c.temp == null || Number.isNaN(c.temp) ? '—' : `${c.temp}°`}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#414942', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {c.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
