'use client'

import { SignUp, useAuth } from '@clerk/nextjs'
import Header from '@/components/Header'
import ViaKashmirLogo from '@/components/ViaKashmirLogo'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) router.push('/dashboard')
  }, [isLoaded, isSignedIn, router])

  return (
    <>
      <Header />

      <main className="login-shell">
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <i className="fi fi-rr-mountains" style={{ fontSize: 56, color: '#00361a' }} />
          </div>

          <div className="card-elevated" style={{ overflow: 'hidden' }}>
            <div className="login-card-head">
              <i
                className="fi fi-rr-mountains"
                style={{
                  position: 'absolute', right: -24, bottom: -28,
                  fontSize: 180, color: 'rgba(184,240,197,0.08)', pointerEvents: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ViaKashmirLogo variant="light" size="lg" />
              </div>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.65)', marginTop: 14, fontFamily: 'Inter, sans-serif',
              }}>
                List Your Hotel on the Portal
              </p>
            </div>

            <div className="login-card-body" style={{ display: 'flex', justifyContent: 'center' }}>
              <SignUp
                routing="path"
                path="/signup"
                signInUrl="/login"
                fallbackRedirectUrl="/dashboard"
                forceRedirectUrl="/dashboard"
              />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            <a href="/" style={{ color: '#00361a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <i className="fi fi-rr-angle-small-left" style={{ fontSize: 14 }} /> Back to Live Rates
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
