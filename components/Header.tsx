'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import ViaKashmirLogo from './ViaKashmirLogo'

export default function Header() {
  const path = usePathname()
  const router = useRouter()
  const { isSignedIn, signOut } = useAuth()
  const { user } = useUser()
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role as 'admin' | 'vendor' | 'customer' | undefined

  const portalHref =
    role === 'admin'  ? '/admin' :
    role === 'vendor' ? '/vendor' :
    isSignedIn        ? '/customer' : null
  const portalLabel =
    role === 'admin'  ? 'Admin' :
    role === 'vendor' ? 'My Hotel' :
    'My Dashboard'
  const portalIcon =
    role === 'admin'  ? 'fi-rr-shield-check' :
    role === 'vendor' ? 'fi-rr-building' :
    'fi-rr-dashboard'

  const handleLogout = () => signOut(() => router.push('/'))

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)',
      }}
    >
      <div className="app-header-row">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <ViaKashmirLogo variant="light" size="md" />
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button
              className="btn-ghost nav-button"
              style={{
                padding: '10px 16px', fontSize: 13,
                color: path === '/' ? '#b8f0c5' : 'rgba(255,255,255,0.78)',
                background: path === '/' ? 'rgba(184,240,197,0.12)' : 'transparent',
              }}
            >
              <i className="fi fi-rr-eye" style={{ fontSize: 14 }} />
              <span className="nav-label">Live Rates</span>
            </button>
          </Link>

          {isSignedIn && portalHref && (
            <Link href={portalHref} style={{ textDecoration: 'none' }}>
              <button
                className="btn-ghost nav-button"
                style={{
                  padding: '10px 16px', fontSize: 13,
                  color: path === portalHref ? '#b8f0c5' : 'rgba(255,255,255,0.78)',
                  background: path === portalHref ? 'rgba(184,240,197,0.12)' : 'transparent',
                }}
              >
                <i className={`fi ${portalIcon}`} style={{ fontSize: 14 }} />
                <span className="nav-label">{portalLabel}</span>
              </button>
            </Link>
          )}

          {isSignedIn ? (
            <button onClick={handleLogout} className="btn-danger nav-button" style={{ padding: '10px 16px', fontSize: 13 }}>
              <i className="fi fi-rr-sign-out-alt" style={{ fontSize: 14 }} />
              <span className="nav-label">Sign Out</span>
            </button>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button className="btn-tertiary nav-button" style={{ padding: '10px 18px', fontSize: 13 }}>
                <i className="fi fi-rr-lock" style={{ fontSize: 14 }} />
                <span className="nav-label">Sign In</span>
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
