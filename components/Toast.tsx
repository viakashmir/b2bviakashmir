'use client'

import { useEffect, useState } from 'react'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface Props {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 350)
    }, 3200)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const palette = {
    success: { bg: '#00361a', color: '#b8f0c5', icon: 'fi-rs-check-circle' },
    error:   { bg: '#ffdad6', color: '#93000a', icon: 'fi-rs-exclamation' },
    info:    { bg: '#ffffff', color: '#191c1d', icon: 'fi-rs-info' },
  }[toast.type]

  return (
    <div
      style={{
        background: palette.bg, color: palette.color,
        padding: '14px 20px', borderRadius: 9999,
        display: 'flex', alignItems: 'center', gap: 10,
        minWidth: 280, maxWidth: 380, pointerEvents: 'all',
        boxShadow: '0 8px 32px rgba(25,28,29,0.18)',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
      }}
    >
      <i className={`fi ${palette.icon}`} style={{ fontSize: 16, flexShrink: 0 }} />
      <span>{toast.message}</span>
    </div>
  )
}
