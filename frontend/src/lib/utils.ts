import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scoreTone(score: number) {
  if (score >= 80)
    return { label: 'Excellent', color: 'text-emerald-700', bg: 'bg-emerald-50', ring: '#059669' }
  if (score >= 65)
    return { label: 'Strong', color: 'text-blue-700', bg: 'bg-blue-50', ring: '#2563eb' }
  if (score >= 45)
    return { label: 'Needs work', color: 'text-amber-700', bg: 'bg-amber-50', ring: '#d97706' }
  return { label: 'High priority', color: 'text-rose-700', bg: 'bg-rose-50', ring: '#e11d48' }
}

export function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
