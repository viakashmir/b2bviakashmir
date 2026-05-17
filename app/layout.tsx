import type { Metadata } from 'next'
import Script from 'next/script'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const GA_ID = 'G-VGLJEWW5WS'

export const metadata: Metadata = {
  title: 'Via Kashmir, B2B Hotel Rate Portal',
  description: 'Live B2B hotel rates from Via Kashmir for travel agents across Srinagar, Dal Lake, Gulmarg, Pahalgam, Sonamarg and Gurez.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#00361a',
          colorBackground: '#ffffff',
          colorText: '#191c1d',
          colorTextSecondary: '#414942',
          colorInputBackground: '#f3f4f5',
          colorInputText: '#191c1d',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
        },
        elements: {
          formButtonPrimary:
            'bg-gradient-to-br from-[#00361a] to-[#1a4d2e] hover:shadow-lg rounded-full font-display font-bold',
          card: 'shadow-none',
          headerTitle: 'font-display',
          headerSubtitle: 'font-body',
        },
      }}
    >
      <html lang="en">
        <head>
          {/* Google Analytics, gtag.js */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}</Script>
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
