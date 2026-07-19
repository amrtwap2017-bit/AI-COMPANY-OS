'use client'

/**
 * useTokenSync — Syncs sessionStorage token to cookie
 * Cookie is needed for middleware to read the token server-side.
 * Call this in the root layout or providers.
 */
import { useEffect } from 'react'
import { getAccessToken } from '@/lib/api/client'

export function useTokenSync() {
  useEffect(() => {
    const sync = () => {
      const token = getAccessToken()
      if (token) {
        // Set a cookie that middleware can read
        // Note: not httpOnly (client needs to set it)
        // In production, use a proper auth server that sets httpOnly cookies
        document.cookie = `tb_access_token=${token}; path=/; SameSite=Strict; max-age=86400`
      } else {
        // Clear cookie on logout
        document.cookie = 'tb_access_token=; path=/; max-age=0'
      }
    }

    // Sync on mount
    sync()

    // Sync on storage events (other tabs)
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
}
