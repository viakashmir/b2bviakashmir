'use client'

interface Props {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

const HEIGHTS = { sm: 30, md: 38, lg: 56 } as const

export default function ViaKashmirLogo({ variant = 'light', size = 'md' }: Props) {
  const h = HEIGHTS[size]
  // SVG aspect ratio is 375:112, width follows height to keep proportions.
  const w = Math.round(h * (375 / 112))

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Via Kashmir, B2B Rate Portal"
      width={w}
      height={h}
      style={{
        height: h,
        width: 'auto',
        display: 'block',
        // On dark headers the brand mark already reads yellow-on-transparent.
        // On light surfaces, drop a subtle background-free render, no filter needed.
        filter: variant === 'dark' ? 'none' : 'none',
      }}
    />
  )
}
