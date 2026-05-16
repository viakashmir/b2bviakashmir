'use client'

interface Props {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

export default function ViaKashmirLogo({ variant = 'light', size = 'md' }: Props) {
  const textColor = variant === 'light' ? '#ffffff' : '#00361a'
  const accentColor = variant === 'light' ? '#b8f0c5' : '#1d5031'
  const subColor = variant === 'light' ? 'rgba(255,255,255,0.55)' : '#717971'

  const sizes = {
    sm: { icon: 22, fontSize: 15, subSize: 9, gap: 10 },
    md: { icon: 28, fontSize: 19, subSize: 10, gap: 12 },
    lg: { icon: 36, fontSize: 24, subSize: 11, gap: 14 },
  }
  const s = sizes[size]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
      <i className="fi fi-rr-mountains" style={{ fontSize: s.icon, color: accentColor, display: 'inline-flex' }} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: s.fontSize,
          fontWeight: 800,
          color: textColor,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          Via Kashmir
        </span>
        <span className="logo-sub" style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: s.subSize,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: subColor,
          marginTop: 5,
        }}>
          Rate Portal
        </span>
      </div>
    </div>
  )
}
