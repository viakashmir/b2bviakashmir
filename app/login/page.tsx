'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import ViaKashmirLogo from '@/components/ViaKashmirLogo'
import Toast, { ToastMessage } from '@/components/Toast'
import { loadHotels, loadSession, saveSession, clearSession, validateLogin } from '@/lib/storage'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const session = loadSession()
    if (session) {
      setIsLoggedIn(true)
      router.push('/dashboard')
    }
    setMounted(true)
  }, [router])

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const handleLogout = () => {
    clearSession()
    setIsLoggedIn(false)
    addToast('Signed out', 'info')
  }

  const handleLogin = async () => {
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const hotels = loadHotels()
    const hotel = validateLogin(hotels, username, password)
    if (hotel) {
      saveSession({ hotelId: hotel.id, loginTime: Date.now() })
      setIsLoggedIn(true)
      router.push('/dashboard')
    } else {
      setLoading(false)
      if (hotels[username.trim().toLowerCase()]) {
        setError('Incorrect password. Please try again.')
      } else {
        setError('Hotel not found. Check your username.')
      }
    }
  }

  const quickFill = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
    setError('')
  }

  const DEMOS = [
    { label: 'Grand Palace', u: 'grandpalace', p: 'gp2024' },
    { label: 'Dal View', u: 'dalviewhouseboats', p: 'dv2024' },
    { label: 'Himalayan Crest', u: 'himalayancrest', p: 'hc2024' },
    { label: 'Pinewood', u: 'pinewood', p: 'pw2024' },
    { label: 'Sonamarg Alpine', u: 'sonamargresort', p: 'sr2024' },
  ]

  if (!mounted) return null

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <main style={{
        minHeight: 'calc(100vh - 76px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 40, background: '#f8f9fa',
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <i className="fi fi-rr-mountains" style={{ fontSize: 56, color: '#00361a' }} />
          </div>

          <div className="card-elevated" style={{ overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #00361a 0%, #1a4d2e 60%, #004e5f 100%)',
              padding: '36px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <i className="fi fi-rr-mountains" style={{
                position: 'absolute', right: -24, bottom: -28,
                fontSize: 180, color: 'rgba(184,240,197,0.08)', pointerEvents: 'none',
              }} />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ViaKashmirLogo variant="light" size="lg" />
              </div>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.65)', marginTop: 14, fontFamily: 'Inter, sans-serif',
              }}>
                Hotel Rate Management Portal
              </p>
            </div>

            <div style={{ padding: '32px 40px' }}>
              {error && (
                <div style={{
                  background: '#ffdad6', borderRadius: 12,
                  padding: '12px 16px', fontSize: 13, color: '#93000a',
                  marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
                  fontFamily: 'Inter, sans-serif', fontWeight: 600,
                }}>
                  <i className="fi fi-rs-exclamation" style={{ fontSize: 15, flexShrink: 0 }} />
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: '#414942', marginBottom: 8, fontFamily: 'Inter, sans-serif',
                }}>Hotel Username</label>
                <div style={{ position: 'relative' }}>
                  <i className="fi fi-rr-user" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#717971' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && document.getElementById('pwd-input')?.focus()}
                    placeholder="your-hotel-id"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="input-field"
                    style={{ padding: '14px 14px 14px 44px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: '#414942', marginBottom: 8, fontFamily: 'Inter, sans-serif',
                }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <i className="fi fi-rr-lock" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#717971' }} />
                  <input
                    id="pwd-input"
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="••••••••"
                    className="input-field"
                    style={{ padding: '14px 14px 14px 44px' }}
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: 16, fontSize: 15 }}
              >
                {loading ? (
                  <span className="spin" style={{
                    display: 'inline-block', width: 18, height: 18,
                    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff',
                    borderRadius: '50%',
                  }} />
                ) : (
                  <>
                    <i className="fi fi-rr-arrow-right" style={{ fontSize: 14 }} />
                    Sign In to Dashboard
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', fontSize: 11, color: '#717971', margin: '24px 0 14px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                — Demo Accounts —
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {DEMOS.map(d => (
                  <button
                    key={d.u}
                    onClick={() => quickFill(d.u, d.p)}
                    className="btn-secondary"
                    style={{ padding: '7px 14px', fontSize: 11 }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            <a href="/" style={{ color: '#00361a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <i className="fi fi-rr-angle-small-left" style={{ fontSize: 14 }} /> Back to Live Rates
            </a>
          </div>
        </div>
      </main>

      <Toast toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </>
  )
}
