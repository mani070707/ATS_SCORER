import { z } from 'zod'

export const componentScoresSchema = z.object({
  formatting: z.number(),
  keywords: z.number(),
  content: z.number(),
  skill_validation: z.number(),
  ats_compatibility: z.number(),
})

export const jdComparisonSchema = z.object({
  match_percentage: z.number(),
  semantic_similarity: z.number(),
  matched_keywords: z.array(z.string()).default([]),
  missing_keywords: z.array(z.string()).default([]),
  skills_gap: z.array(z.string()).default([]),
})

export const issueSchema = z.object({
  issue_title: z.string(),
  severity_level: z.string(),
  ats_impact: z.string(),
  explanation: z.string(),
  where_it_appears: z.string(),
  how_to_fix: z.string(),
  action_items: z.array(z.string()).default([]),
  example_improvement: z.string(),
})

export const skillValidationSchema = z.object({
  validated: z.array(z.record(z.string(), z.unknown())).default([]),
  unvalidated: z.array(z.string()).default([]),
  total: z.number().default(0),
  validated_count: z.number().default(0),
  validation_pct: z.number().default(0),
})

export const analysisSchema = z
  .object({
    ATS_score: z.number().optional(),
    ats_score: z.number().optional(),
    component_scores: componentScoresSchema,
    issues_summary: z.array(z.string()).default([]),
    detailed_feedback: z.array(issueSchema).default([]),
    jd_match_analysis: jdComparisonSchema.nullish(),
    skill_validation_details: skillValidationSchema.nullish(),
    keyword_match: z.number().default(0),
    missing_keywords: z.array(z.string()).default([]),
    matched_keywords: z.array(z.string()).default([]),
    suggestions: z.array(z.string()).default([]),
    strengths: z.array(z.string()).default([]),
    critical_issues: z.array(z.string()).default([]),
    skills: z.array(z.string()).default([]),
    jd_comparison: jdComparisonSchema.nullish(),
    warnings: z.array(z.string()).default([]),
    interpretation: z.string().default(''),
  })
  .transform((value) => ({
    ...value,
    score: value.ATS_score ?? value.ats_score ?? 0,
    jd: value.jd_match_analysis ?? value.jd_comparison ?? null,
  }))

export const historyItemSchema = z.object({
  id: z.string(),
  filename: z.string().default('resume'),
  ats_score: z.number().default(0),
  keyword_match: z.number().default(0),
  missing_keywords: z.array(z.string()).default([]),
  created_at: z.string(),
  analysis_result: z.record(z.string(), z.unknown()),
})

export const historySchema = z.array(historyItemSchema)
export type Analysis = z.infer<typeof analysisSchema>
export type HistoryItem = z.infer<typeof historyItemSchema>

export const authFormSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
export type AuthFormValues = z.infer<typeof authFormSchema>

const acceptedExtensions = ['pdf', 'doc', 'docx']
export function validateResume(file: File | undefined) {
  if (!file) return 'Choose a resume to continue'
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!acceptedExtensions.includes(extension)) return 'Use a PDF, DOC, or DOCX file'
  if (file.size > 5 * 1024 * 1024) return 'Resume must be 5 MB or smaller'
  return null
}

export function analysisSummary(analysis: Analysis) {
  const sections = [`ATS Score: ${Math.round(analysis.score)}/100`, '']
  const add = (title: string, items: string[]) => {
    if (!items.length) return
    sections.push(`${title}:`, ...items.map((item) => `- ${item}`), '')
  }
  add('STRENGTHS', analysis.strengths)
  add('CRITICAL ISSUES', analysis.critical_issues)
  add('RECOMMENDATIONS', analysis.suggestions)
  return sections.join('\n').trim()
}
