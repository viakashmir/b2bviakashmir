'use client'

interface Props {
  stars: number
  size?: number
  variant?: 'light' | 'dark'
  showLabel?: boolean
}

const LABELS: Record<number, string> = {
  1: '1 Star',
  2: '2 Star',
  3: '3 Star',
  4: '4 Star',
  5: '5 Star Deluxe',
}

export default function StarRating({ stars, size = 12, variant = 'light', showLabel = false }: Props) {
  const filled = '#f09f5e'
  const empty = variant === 'light' ? 'rgba(255,255,255,0.25)' : 'rgba(0,54,26,0.15)'
  const labelColor = variant === 'light' ? 'rgba(255,255,255,0.7)' : '#717971'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'inline-flex', gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <i
            key={i}
            className={i < stars ? 'fi fi-rs-star' : 'fi fi-rr-star'}
            style={{ fontSize: size, color: i < stars ? filled : empty, lineHeight: 1 }}
            aria-hidden="true"
          />
        ))}
      </div>
      {showLabel && (
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: labelColor,
        }}>
          {LABELS[stars]}
        </span>
      )}
    </div>
  )
}
