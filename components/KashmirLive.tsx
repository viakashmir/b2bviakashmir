'use client'

import { useEffect, useState } from 'react'
import { LOCATION_COORDS, LOCATION_LABELS, Location } from '@/lib/data'
import {
  Clock, Sun, Cloud, CloudSun, CloudFog, CloudRain, CloudSnow,
  CloudLightning, Mountain,
} from 'lucide-react'

interface CityWeather {
  key: Location
  label: string
  temp: number | null
  code: number | null
}

const CITY_ORDER: Location[] = ['srinagar', 'gulmarg', 'pahalgam', 'sonamarg', 'gurez']

/** Map WMO weather code (open-meteo) → lucide icon + label */
function wmoIcon(code: number | null) {
  if (code == null) return { Icon: Cloud,           label: '—',         color: '#9dd3aa' }
  if (code === 0)   return { Icon: Sun,             label: 'Clear',     color: '#ffdcc4' }
  if (code <= 3)    return { Icon: CloudSun,        label: 'Cloudy',    color: '#b8f0c5' }
  if (code <= 48)   return { Icon: CloudFog,        label: 'Foggy',     color: '#c1c9bf' }
  if (code <= 67)   return { Icon: CloudRain,       label: 'Rain',      color: '#a1e7ff' }
  if (code <= 77)   return { Icon: CloudSnow,       label: 'Snow',      color: '#ffffff' }
  if (code <= 82)   return { Icon: CloudRain,       label: 'Showers',   color: '#a1e7ff' }
  if (code >= 95)   return { Icon: CloudLightning,  label: 'Thunder',   color: '#b8f0c5' }
  return              { Icon: Cloud,                label: 'Cloudy',    color: '#b8f0c5' }
}

export default function KashmirLive() {
  const [now, setNow] = useState<Date | null>(null)
  const [cities, setCities] = useState<CityWeather[]>(
    CITY_ORDER.map(k => ({ key: k, label: LOCATION_LABELS[k], temp: null, code: null }))
  )

  // Clock — ticks every second
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Weather — one fetch per city, parallel. Survives if one fails.
  useEffect(() => {
    let alive = true
    const load = async () => {
      const results = await Promise.allSettled(CITY_ORDER.map(async k => {
        const { lat, lon } = LOCATION_COORDS[k]
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia%2FKolkata`)
        if (!res.ok) throw new Error(`open-meteo ${res.status}`)
        const data = await res.json()
        return {
          key: k, label: LOCATION_LABELS[k],
          temp: Math.round(data?.current?.temperature_2m ?? Number.NaN),
          code: data?.current?.weather_code ?? null,
        } as CityWeather
      }))
      if (!alive) return
      setCities(results.map((r, i) =>
        r.status === 'fulfilled'
          ? r.value
          : { key: CITY_ORDER[i], label: LOCATION_LABELS[CITY_ORDER[i]], temp: null, code: null }
      ))
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
        <Mountain size={110} color="rgba(184,240,197,0.08)" style={{ position: 'absolute', right: -16, top: -10, pointerEvents: 'none' }} />
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9dd3aa', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={11} strokeWidth={2.5} />
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
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#717971', fontFamily: 'Inter, sans-serif', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CloudSun size={12} strokeWidth={2.2} color="#13677b" />
          Live Weather
        </div>
        <div className="weather-row" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: 6,
        }}>
          {cities.map(c => {
            const { Icon } = wmoIcon(c.code)
            return (
              <div key={c.key} style={{
                padding: '10px 8px',
                borderRadius: 12,
                background: '#f3f4f5',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4,
                fontFamily: 'Inter, sans-serif',
              }}>
                <Icon size={18} strokeWidth={2} color="#00361a" />
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
