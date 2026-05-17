'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Eye, LogOut, Building2, Lock, LayoutDashboard, ShieldCheck, User } from 'lucide-react'
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
  const PortalIcon =
    role === 'admin'  ? ShieldCheck :
    role === 'vendor' ? Building2 :
    LayoutDashboard

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
              <Eye size={14} strokeWidth={2.2} />
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
                <PortalIcon size={14} strokeWidth={2.2} />
                <span className="nav-label">{portalLabel}</span>
              </button>
            </Link>
          )}

          {isSignedIn ? (
            <button onClick={handleLogout} className="btn-danger nav-button" style={{ padding: '10px 16px', fontSize: 13 }}>
              <LogOut size={14} strokeWidth={2.2} />
              <span className="nav-label">Sign Out</span>
            </button>
          ) : (
            <>
              <Link href="/signup" style={{ textDecoration: 'none' }}>
                <button
                  className="btn-ghost nav-button"
                  style={{
                    padding: '10px 16px', fontSize: 13,
                    color: '#ffffff',
                    background: 'rgba(255,255,255,0.14)',
                  }}
                >
                  <Building2 size={14} strokeWidth={2.2} />
                  <span className="nav-label">
                    <span className="hide-on-mobile">Hotel </span>Register
                  </span>
                </button>
              </Link>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <button className="btn-tertiary nav-button" style={{ padding: '10px 18px', fontSize: 13 }}>
                  <Lock size={14} strokeWidth={2.2} />
                  <span className="nav-label">
                    <span className="hide-on-mobile">Hotel </span>Login
                  </span>
                </button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
