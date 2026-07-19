'use client'

/**
 * AuthGuard — Client-side route protection
 * Wraps protected pages. Shows loading while checking auth.
 * Redirects to /login if not authenticated.
 *
 * Usage:
 *   <AuthGuard>
 *     <YourPage />
 *   </AuthGuard>
 *
 * Note: Middleware handles server-side protection.
 * This handles the client-side hydration gap.
 */
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAccessToken } from '@/lib/api/client'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [checked, setChecked] = React.useState(false)
  const [authed,  setAuthed]  = React.useState(false)

  React.useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      const from = searchParams.get('from') ?? '/operations'
      router.replace(`/login?from=${encodeURIComponent(from)}`)
    } else {
      setAuthed(true)
    }
    setChecked(true)
  }, [router, searchParams])

  if (!checked) {
    return fallback ?? (
      <div className="flex h-screen w-full items-center justify-center"
        style={{ background:'var(--tb-surface-base)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor:'var(--tb-brand-accent)' }} />
          <p className="text-sm" style={{ color:'var(--tb-text-tertiary)' }}>
            Checking session...
          </p>
        </div>
      </div>
    )
  }

  if (!authed) return null

  return <>{children}</>
}
