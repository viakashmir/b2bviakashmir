'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUser, useAuth } from '@clerk/nextjs'
import {
  LayoutDashboard, BedDouble, Calendar, MessageSquare, Building2,
  Eye, LogOut, Bell, Search, Menu, X as XIcon, ChevronRight,
} from 'lucide-react'

interface Props {
  children: React.ReactNode
}

const NAV: { href: string; label: string; Icon: typeof LayoutDashboard }[] = [
  { href: '/vendor',           label: 'Dashboard',          Icon: LayoutDashboard },
  { href: '/vendor/inventory', label: 'Inventory Calendar', Icon: Calendar },
]

export default function VendorShell({ children }: Props) {
  const path = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false) // mobile sidebar

  const handleLogout = () => signOut(() => router.push('/'))

  const displayName = user?.fullName || user?.firstName || user?.username || 'Vendor'
  const email = user?.primaryEmailAddress?.emailAddress ?? ''

  return (
    <div className="vendor-shell">
      {/* SIDEBAR */}
      <aside
        className={`vendor-sidebar ${open ? 'open' : ''}`}
        style={{
          background: '#00361a',
          color: '#ffffff',
          display: 'flex', flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '24px 22px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #b8f0c5, #9dd3aa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#00361a', fontFamily: 'Manrope, sans-serif', fontWeight: 900, fontSize: 18,
            }}>
              V
            </span>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em', lineHeight: 1 }}>
                Via Kashmir
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(184,240,197,0.7)', marginTop: 4 }}>
                Vendor Portal
              </div>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="sidebar-close"
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: '#ffffff', cursor: 'pointer', borderRadius: 8,
              width: 32, height: 32, display: 'none', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Close menu"
          >
            <XIcon size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ padding: '12px 8px 6px', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(184,240,197,0.55)' }}>
            Main
          </div>
          {NAV.map(item => {
            const active = path === item.href || (item.href !== '/vendor' && path.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px', borderRadius: 10,
                  background: active ? 'rgba(184,240,197,0.12)' : 'transparent',
                  color: active ? '#b8f0c5' : 'rgba(255,255,255,0.78)',
                  transition: 'background 0.15s, color 0.15s',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: 13.5, fontWeight: active ? 700 : 500,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <item.Icon size={16} strokeWidth={2.2} />
                    {item.label}
                  </span>
                  {active && <ChevronRight size={14} strokeWidth={2.3} />}
                </div>
              </Link>
            )
          })}

          <div style={{ padding: '20px 8px 6px', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(184,240,197,0.55)' }}>
            Quick links
          </div>
          <Link href="/" onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10,
              color: 'rgba(255,255,255,0.78)', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 13.5, fontWeight: 500,
            }}>
              <Eye size={16} strokeWidth={2.2} />
              Public Rate Board
            </div>
          </Link>
        </nav>

        {/* User card at bottom */}
        <div style={{
          margin: '8px 14px 18px', padding: 14, borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 9999,
            background: 'linear-gradient(135deg, #b8f0c5, #9dd3aa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#00361a', fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 14,
            flexShrink: 0,
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
              {email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none',
              color: 'rgba(255,255,255,0.85)', cursor: 'pointer',
              borderRadius: 9999, width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
          >
            <LogOut size={14} strokeWidth={2.2} />
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {open && (
        <div
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,54,26,0.5)',
            backdropFilter: 'blur(4px)', zIndex: 80, display: 'none',
          }}
        />
      )}

      {/* MAIN */}
      <div className="vendor-main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8f9fa' }}>
        {/* Top bar */}
        <header
          style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 28px', gap: 16,
            boxShadow: '0 1px 0 #edeeef',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
            <button
              onClick={() => setOpen(true)}
              className="sidebar-toggle"
              aria-label="Open menu"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: 8, borderRadius: 8,
                color: '#414942', display: 'none',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f3f4f5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Menu size={20} strokeWidth={2.2} />
            </button>

            <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
              <Search size={14} strokeWidth={2.2} color="#717971" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="search"
                placeholder="Search rooms, dates, bookings…"
                className="input-field"
                style={{ padding: '10px 14px 10px 40px', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: 12 }}
              >
                <Eye size={12} strokeWidth={2.3} />
                <span className="hide-on-mobile">View public board</span>
              </button>
            </Link>
            <button
              aria-label="Notifications"
              style={{
                background: '#f3f4f5', border: 'none', cursor: 'pointer',
                borderRadius: 9999, width: 38, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#414942',
              }}
            >
              <Bell size={16} strokeWidth={2.2} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: '24px 28px 48px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
