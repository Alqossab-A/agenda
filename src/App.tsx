import { useEffect, useState } from 'react'
import { ThreeColumnLayout } from './components/layout/ThreeColumnLayout'
import { AppProvider } from './context/AppContext'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

function LoginScreen() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111827',
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        gap: 24,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            background: '#4f46e5',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 800,
            color: '#fff',
          }}
        >
          S
        </div>
        <span style={{ fontSize: 24, fontWeight: 700, color: '#e2e8f0' }}>
          Sunflow
        </span>
      </div>

      <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
        Your personal productivity dashboard
      </p>

      {/* Sign in button */}
      <button
        onClick={() => { window.location.href = '/api/auth/google' }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#fff',
          color: '#111827',
          border: 'none',
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
        </svg>
        Sign in with Google
      </button>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111827',
      }}
    >
      <div style={{ color: '#6b7280', fontSize: 13 }}>Loading…</div>
    </div>
  )
}

export default function App() {
  const [auth, setAuth] = useState<AuthState>('loading')

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => setAuth(res.ok ? 'authenticated' : 'unauthenticated'))
      .catch(() => setAuth('unauthenticated'))
  }, [])

  if (auth === 'loading')       return <LoadingScreen />
  if (auth === 'unauthenticated') return <LoginScreen />

  return (
    <AppProvider>
      <div
        style={{
          height: '100vh',
          width: '100%v',
          display: 'flex',
          flexDirection: 'column',
          background: '#111827',
          color: '#f9fafb',
          fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            height: 48,
            borderBottom: '1px solid #1f2937',
            background: '#0f172a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 24,
                height: 24,
                background: '#4f46e5',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                color: '#fff',
              }}
            >
              S
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
              Sunflow
            </span>
          </div>

          <span style={{ fontSize: 13, color: '#6b7280' }}>{today}</span>

          <button
            onClick={() => { window.location.href = '/api/auth/logout' }}
            style={{
              fontSize: 11,
              color: '#6b7280',
              background: 'transparent',
              border: '1px solid #374151',
              borderRadius: 4,
              padding: '4px 10px',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </header>

        <ThreeColumnLayout />
      </div>
    </AppProvider>
  )
}