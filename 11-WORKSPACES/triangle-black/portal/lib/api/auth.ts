// @ts-nocheck
/**
 * Triangle Black — Authentication API
 */
import { api, setAccessToken, clearTokens } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user_id: string
  name: string
  email: string
  role: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/json', {
      email,
      password,
    })
    if (response.access_token) {
      setAccessToken(response.access_token)
    }
    return response
  },

  logout(): void {
    clearTokens()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },

  async me(): Promise<UserProfile> {
    return api.get<UserProfile>('/auth/me')
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  },
}
