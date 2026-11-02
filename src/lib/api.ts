import { i18n } from '@/i18n'

export class ApiError extends Error {
  readonly status: number
  /** Field errors from a 422 response, keyed by field name. */
  readonly errors: Record<string, string[]>

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

type Query = Record<string, string | number | boolean | null | undefined>

function buildUrl(path: string, query: Query = {}): string {
  const url = new URL(`${import.meta.env.VITE_API_BASE_URL}${path}`)

  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value === true ? 1 : value === false ? 0 : value))
    }
  }

  return url.toString()
}

async function request<T>(method: 'GET' | 'POST', path: string, query?: Query, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    // The API answers translatable fields in this language (EN fallback).
    'Accept-Language': i18n.global.locale.value,
  }
  const init: RequestInit = { method, headers }

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body ?? {})
  }

  const response = await fetch(buildUrl(path, query), init)

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]> }

    throw new ApiError(response.status, payload.message ?? `${method} ${path} failed with status ${response.status}`, payload.errors)
  }

  return (await response.json()) as T
}

/**
 * GET a JSON resource from the Laravel API (VITE_API_BASE_URL, e.g. http://127.0.0.1:8003/api/v1).
 */
export function apiGet<T>(path: string, query?: Query): Promise<T> {
  return request<T>('GET', path, query)
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>('POST', path, undefined, body)
}
