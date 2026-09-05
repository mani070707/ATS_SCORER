import { analysisSchema, historySchema, type Analysis } from '@/lib/schemas'

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request(path: string, token?: string, init: RequestInit = {}) {
  if (!navigator.onLine) throw new ApiError('You appear to be offline. Check your connection.', 0)
  const controller = new AbortController()
  const timeout = window.setTimeout(
    () => controller.abort(),
    path.includes('analyze') ? 180_000 : 30_000,
  )
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
      signal: controller.signal,
    })
    if (!response.ok) {
      let detail = ''
      try {
        const body = (await response.json()) as { detail?: string | Array<{ msg?: string }> }
        detail = Array.isArray(body.detail)
          ? body.detail
              .map((item) => item.msg)
              .filter(Boolean)
              .join(', ')
          : (body.detail ?? '')
      } catch {
        detail = await response.text().catch(() => '')
      }
      const fallback =
        response.status === 401
          ? 'Your session expired. Please sign in again.'
          : response.status === 503
            ? 'The analysis engine is warming up. Try again in a minute.'
            : 'Something went wrong. Please try again.'
      throw new ApiError(detail || fallback, response.status)
    }
    return response
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError')
      throw new ApiError('The request took too long. Please try again.', 408)
    throw new ApiError('Could not reach the analysis service. Please try again shortly.', 0)
  } finally {
    clearTimeout(timeout)
  }
}

export async function getHealth() {
  const response = await request('/api/v1/health')
  return (await response.json()) as {
    status: 'healthy' | 'warming_up' | 'error'
    model_error?: string | null
  }
}

export async function analyzeResume(file: File, jobDescription: string, token: string) {
  const data = new FormData()
  data.append('resume', file)
  data.append('job_description', jobDescription)
  const response = await request('/api/v1/analyze-resume', token, { method: 'POST', body: data })
  return analysisSchema.parse(await response.json())
}

export async function getHistory(token: string) {
  const response = await request('/api/v1/history', token)
  return historySchema.parse(await response.json())
}

export async function deleteHistory(id: string, token: string) {
  await request(`/api/v1/history/${encodeURIComponent(id)}`, token, { method: 'DELETE' })
}

export async function generatePdf(analysis: Analysis, token: string) {
  const payload: Record<string, unknown> = { ...analysis }
  delete payload.score
  delete payload.jd
  const response = await request('/api/v1/generate-pdf', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return response.blob()
}

export async function getHistoryPdf(id: string, token: string) {
  const response = await request(`/api/v1/history/${encodeURIComponent(id)}/pdf`, token)
  return response.blob()
}
