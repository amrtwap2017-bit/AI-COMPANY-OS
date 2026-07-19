'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, getAccessToken, clearTokens, type LoginRequest } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router  = useRouter()
  const qc      = useQueryClient()
  const hasToken = !!getAccessToken()

  const { data:user, isLoading, error } = useQuery({
    queryKey: ['auth','me'],
    queryFn:  authApi.me,
    enabled:  hasToken,
    retry:    false,
    staleTime: 5*60_000,
  })

  const loginMutation = useMutation({
    mutationFn: (creds: LoginRequest) => authApi.login(creds),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey:['auth','me'] })
      toast.success(`Welcome back, ${data.user.full_name}`)
      router.push('/operations')
    },
    onError: (err: Error) => toast.error(`Login failed: ${err.message}`),
  })

  const logout = () => {
    qc.clear()
    clearTokens()
    toast.info('Signed out successfully')
    router.push('/login')
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login:        loginMutation.mutate,
    loginAsync:   loginMutation.mutateAsync,
    loginLoading: loginMutation.isPending,
    loginError:   loginMutation.error,
    logout,
  }
}
