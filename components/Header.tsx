'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ViaKashmirLogo from './ViaKashmirLogo'

interface Props {
  isLoggedIn: boolean
  onLogout: () => void
}

export default function Header({ isLoggedIn, onLogout }: Props) {
  const path = usePathname()

  return (
    <header
      className="glass-nav"
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 100%)',
      }}
    >
      <div style={{
        maxWidth: 1180, margin: '0 auto', padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 76,
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <ViaKashmirLogo variant="light" size="md" />
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button
              className="btn-ghost"
              style={{
                padding: '10px 18px', fontSize: 13,
                color: path === '/' ? '#b8f0c5' : 'rgba(255,255,255,0.75)',
                background: path === '/' ? 'rgba(184,240,197,0.12)' : 'transparent',
              }}
            >
              <i className="fi fi-rr-eye" style={{ fontSize: 14 }} />
              Live Rates
            </button>
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <button
                  className="btn-ghost"
                  style={{
                    padding: '10px 18px', fontSize: 13,
                    color: path === '/dashboard' ? '#b8f0c5' : 'rgba(255,255,255,0.75)',
                    background: path === '/dashboard' ? 'rgba(184,240,197,0.12)' : 'transparent',
                  }}
                >
                  <i className="fi fi-rr-dashboard" style={{ fontSize: 14 }} />
                  My Dashboard
                </button>
              </Link>
              <button
                onClick={onLogout}
                className="btn-danger"
                style={{ padding: '10px 18px', fontSize: 13 }}
              >
                <i className="fi fi-rr-sign-out-alt" style={{ fontSize: 14 }} />
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button
                className="btn-tertiary"
                style={{ padding: '10px 20px', fontSize: 13 }}
              >
                <i className="fi fi-rr-lock" style={{ fontSize: 14 }} />
                Hotel Login
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
