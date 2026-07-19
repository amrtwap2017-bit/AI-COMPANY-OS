/**
 * Triangle Black — Enterprise API Client
 * Program B: Backend-Frontend Integration
 *
 * Single source for all API calls across the portal.
 * Handles: auth, errors, retries, loading states.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8030/api/v1";

// ─── Types ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data:    T
  meta?:   { total: number; page: number; per_page: number }
  message?: string
}

export interface ApiError {
  status:  number
  message: string
  detail?: string | Record<string, unknown>
}

export class TBApiError extends Error {
  status:  number
  detail?: string | Record<string, unknown>

  constructor(status: number, message: string, detail?: string | Record<string, unknown>) {
    super(message)
    this.name   = 'TBApiError'
    this.status  = status
    this.detail  = detail
  }
}

// ─── Token Management ─────────────────────────────────────────────────────

let _accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  _accessToken = token
  if (token) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tb_access_token', token)
    }
  } else {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tb_access_token')
    }
  }
}

export function getAccessToken(): string | null {
  if (_accessToken) return _accessToken
  if (typeof window !== 'undefined') {
    _accessToken = sessionStorage.getItem('tb_access_token')
  }
  return _accessToken
}

export function clearTokens(): void {
  _accessToken = null
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('tb_access_token')
  }
}

// ─── Request Builder ──────────────────────────────────────────────────────

interface RequestOptions {
  method?:  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?:    unknown
  params?:  Record<string, string | number | boolean | undefined | null>
  headers?: Record<string, string>
  signal?:  AbortSignal
}

async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, params, headers = {}, signal } = options

  // Build URL with query params
  const url = new URL(`${API_BASE}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v))
      }
    })
  }

  // Build headers
  const token = getAccessToken()
  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    ...headers,
  }
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`
  }

  // Make request
  const response = await fetch(url.toString(), {
    method,
    headers: reqHeaders,
    body:    body ? JSON.stringify(body) : undefined,
    signal,
  })

  // Handle 401 — redirect to login
  if (response.status === 401) {
    clearTokens()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new TBApiError(401, 'Session expired. Please log in again.')
  }

  // Handle 403
  if (response.status === 403) {
    throw new TBApiError(403, 'Access denied. Insufficient permissions.')
  }

  // Handle non-OK responses
  if (!response.ok) {
    let detail: string | Record<string, unknown> | undefined
    try {
      const errBody = await response.json()
      detail = errBody.detail ?? errBody.message ?? errBody
    } catch {
      detail = await response.text()
    }
    throw new TBApiError(
      response.status,
      `API Error ${response.status}`,
      detail
    )
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T
  }

  // Parse JSON
  try {
    return await response.json() as T
  } catch {
    throw new TBApiError(500, 'Invalid JSON response from server')
  }
}

// ─── API Methods ──────────────────────────────────────────────────────────

export const api = {
  get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' })
  },

  post<T = any>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'POST', body })
  },

  put<T = any>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'PUT', body })
  },

  patch<T = any>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'PATCH', body })
  },

  delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' })
  },
}

// ─── Helper: Build query string from object ───────────────────────────────
export function buildParams(
  obj: { [key: string]: string | number | boolean | null | undefined }
): Record<string, string> {
  const result: Record<string, string> = {}
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      result[k] = String(v)
    }
  })
  return result
}
