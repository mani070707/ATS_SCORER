import { describe, expect, it } from 'vitest'

import { analysisSchema, analysisSummary, validateResume } from '@/lib/schemas'
import { formatDate, scoreTone } from '@/lib/utils'

const baseAnalysis = {
  ATS_score: 76,
  component_scores: {
    formatting: 16,
    keywords: 19,
    content: 20,
    skill_validation: 10,
    ats_compatibility: 11,
  },
  issues_summary: [],
  detailed_feedback: [],
  strengths: ['Clear structure'],
  critical_issues: ['Add metrics'],
  suggestions: ['Tailor keywords'],
}

describe('analysis data utilities', () => {
  it('normalizes the backend score and optional collections', () => {
    const parsed = analysisSchema.parse(baseAnalysis)
    expect(parsed.score).toBe(76)
    expect(parsed.jd).toBeNull()
    expect(parsed.warnings).toEqual([])
  })

  it('rejects malformed backend responses', () => {
    expect(analysisSchema.safeParse({ ATS_score: 'high' }).success).toBe(false)
  })

  it('creates a useful text summary', () => {
    const text = analysisSummary(analysisSchema.parse(baseAnalysis))
    expect(text).toContain('ATS Score: 76/100')
    expect(text).toContain('STRENGTHS:\n- Clear structure')
  })

  it('validates resume extension and size', () => {
    expect(validateResume(undefined)).toMatch(/Choose/)
    expect(validateResume(new File(['x'], 'resume.png'))).toMatch(/PDF/)
    expect(validateResume(new File(['x'], 'resume.pdf'))).toBeNull()
    expect(validateResume(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'resume.pdf'))).toMatch(
      /5 MB/,
    )
  })

  it('formats score tone and dates', () => {
    expect(scoreTone(82).label).toBe('Excellent')
    expect(scoreTone(30).label).toBe('High priority')
    expect(formatDate('not-a-date')).toBe('Date unavailable')
  })
})
