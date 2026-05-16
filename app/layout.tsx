import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Via Kashmir — B2B Hotel Rate Portal',
  description: 'Live B2B hotel rates from Via Kashmir for travel agents across Srinagar, Dal Lake, Gulmarg, Pahalgam, Sonamarg and Gurez.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
