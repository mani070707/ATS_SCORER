import {
  AlertTriangle,
  Check,
  ChevronDown,
  Download,
  FileText,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { analysisSummary, type Analysis } from '@/lib/schemas'
import { cn, downloadBlob, scoreTone } from '@/lib/utils'

const scoreItems = [
  ['Formatting', 'formatting', 20],
  ['Keywords', 'keywords', 25],
  ['Content quality', 'content', 25],
  ['Skill evidence', 'skill_validation', 15],
  ['ATS compatibility', 'ats_compatibility', 15],
] as const

export function AnalysisResults({
  analysis,
  onPdf,
  pdfLoading = false,
  pdfError,
}: {
  analysis: Analysis
  onPdf: () => void
  pdfLoading?: boolean
  pdfError?: string
}) {
  const tone = scoreTone(analysis.score)
  const summaryDownload = () =>
    downloadBlob(
      new Blob([analysisSummary(analysis)], { type: 'text/plain' }),
      'ats-resume-summary.txt',
    )
  return (
    <section className="mt-10 space-y-6 animate-fade-up" aria-labelledby="results-title">
      <div className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-center">
          <div className="mx-auto text-center">
            <ScoreRing score={analysis.score} color={tone.ring} />
            <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
              {tone.label}
            </span>
          </div>
          <div>
            <p className="eyebrow text-indigo-300">Your analysis</p>
            <h2 id="results-title" className="mt-2 text-3xl font-bold">
              Your resume signal is clear.
            </h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              {analysis.interpretation ||
                'Use the priorities below to strengthen your resume before applying.'}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {scoreItems.map(([label, key, max]) => {
                const value = analysis.component_scores[key]
                return (
                  <div key={key} className="rounded-2xl bg-white/8 p-3">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>{label}</span>
                      <span>
                        {Math.round(value)}/{max}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-indigo-400"
                        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {analysis.warnings.length > 0 && (
        <div
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          role="status"
        >
          {analysis.warnings.join(' ')}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard
          icon={<Sparkles />}
          title="What already works"
          items={analysis.strengths}
          empty="Your strongest signals will appear here as you improve the resume."
          tone="success"
        />
        <ListCard
          icon={<AlertTriangle />}
          title="Fix these first"
          items={
            analysis.critical_issues.length ? analysis.critical_issues : analysis.issues_summary
          }
          empty="No urgent ATS issues were found."
          tone="danger"
        />
      </div>
      {analysis.jd && <JDCard analysis={analysis} />}
      <SkillCard analysis={analysis} />
      <FeedbackCard analysis={analysis} />
      <ListCard
        icon={<Lightbulb />}
        title="Recommended next steps"
        items={analysis.suggestions}
        empty="No additional recommendations right now."
        tone="info"
      />
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-slate-950">Keep your report</h3>
          <p className="mt-1 text-sm text-slate-600">
            Download the detailed PDF or a lightweight text summary.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={summaryDownload}>
            <FileText size={17} />
            Text summary
          </Button>
          <Button onClick={onPdf} disabled={pdfLoading}>
            <Download size={17} />
            {pdfLoading ? 'Generating…' : 'PDF report'}
          </Button>
        </div>
      </div>
      {pdfError && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {pdfError}
        </p>
      )}
    </section>
  )
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const value = Math.min(100, Math.max(0, score))
  const circumference = 2 * Math.PI * 54
  return (
    <div className="relative h-36 w-36">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 128 128"
        role="img"
        aria-label={`ATS score ${Math.round(value)} out of 100`}
      >
        <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span>
          <strong className="text-4xl">{Math.round(value)}</strong>
          <small className="block text-xs text-slate-400">out of 100</small>
        </span>
      </div>
    </div>
  )
}

function ListCard({
  icon,
  title,
  items,
  empty,
  tone,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
  empty: string
  tone: 'success' | 'danger' | 'info'
}) {
  const styles =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : tone === 'danger'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-brand-50 text-brand-700'
  return (
    <article className="card">
      <div className="flex items-center gap-3">
        <span className={cn('grid h-10 w-10 place-items-center rounded-xl', styles)}>{icon}</span>
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      </div>
      {items.length ? (
        <ul className="mt-5 space-y-3">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-700">
              <Check className="mt-1 shrink-0 text-brand-600" size={16} />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">{empty}</p>
      )}
    </article>
  )
}

function JDCard({ analysis }: { analysis: Analysis }) {
  const jd = analysis.jd
  if (!jd) return null
  return (
    <article className="card">
      <div className="flex items-center gap-3">
        <span className="icon-box">
          <Target />
        </span>
        <div>
          <p className="eyebrow">Role alignment</p>
          <h3 className="text-xl font-bold text-slate-950">Job description match</h3>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Overall match" value={`${Math.round(jd.match_percentage)}%`} />
        <Metric
          label="Semantic similarity"
          value={`${Math.round(jd.semantic_similarity * 100)}%`}
        />
        <Metric label="Skills to address" value={String(jd.skills_gap.length)} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <KeywordGroup title="Matched keywords" words={jd.matched_keywords} positive />
        <KeywordGroup title="Missing keywords" words={[...jd.missing_keywords, ...jd.skills_gap]} />
      </div>
    </article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  )
}
function KeywordGroup({
  title,
  words,
  positive = false,
}: {
  title: string
  words: string[]
  positive?: boolean
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {words.length ? (
          [...new Set(words)].map((word) => (
            <span
              key={word}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium',
                positive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800',
              )}
            >
              {word}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-500">None</span>
        )}
      </div>
    </div>
  )
}

function SkillCard({ analysis }: { analysis: Analysis }) {
  const skill = analysis.skill_validation_details
  if (!skill || skill.total === 0) return null
  return (
    <article className="card">
      <div className="flex items-center gap-3">
        <span className="icon-box">
          <ShieldCheck />
        </span>
        <div>
          <p className="eyebrow">Evidence check</p>
          <h3 className="text-xl font-bold text-slate-950">Skill validation</h3>
        </div>
        <strong className="ml-auto text-2xl text-brand-700">
          {Math.round(skill.validation_pct)}%
        </strong>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-600"
          style={{ width: `${Math.min(100, skill.validation_pct)}%` }}
        />
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-emerald-700">
            Validated ({skill.validated_count})
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {skill.validated.map((entry, i) => (
              <span key={i} className="tag-success">
                {typeof entry.skill === 'string' ? entry.skill : 'Skill'}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-800">
            Needs evidence ({skill.unvalidated.length})
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {skill.unvalidated.map((item) => (
              <span key={item} className="tag-warning">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

function FeedbackCard({ analysis }: { analysis: Analysis }) {
  const [open, setOpen] = useState<number | null>(0)
  if (!analysis.detailed_feedback.length) return null
  return (
    <article className="card">
      <p className="eyebrow">Detailed review</p>
      <h3 className="mt-1 text-xl font-bold text-slate-950">Why these changes matter</h3>
      <div className="mt-5 divide-y divide-slate-200">
        {analysis.detailed_feedback.map((issue, index) => (
          <div key={`${issue.issue_title}-${index}`}>
            <button
              className="flex w-full items-center gap-3 py-4 text-left"
              aria-expanded={open === index}
              onClick={() => setOpen(open === index ? null : index)}
            >
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-bold capitalize',
                  issue.severity_level.toLowerCase().includes('high') ||
                    issue.severity_level.toLowerCase().includes('critical')
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-amber-50 text-amber-800',
                )}
              >
                {issue.severity_level}
              </span>
              <span className="flex-1 font-semibold text-slate-900">{issue.issue_title}</span>
              <ChevronDown className={cn('transition', open === index && 'rotate-180')} size={18} />
            </button>
            {open === index && (
              <div className="grid gap-4 pb-5 text-sm leading-6 text-slate-600 md:grid-cols-2">
                <div>
                  <strong className="text-slate-900">What is happening</strong>
                  <p>{issue.explanation}</p>
                </div>
                <div>
                  <strong className="text-slate-900">How to fix it</strong>
                  <p>{issue.how_to_fix}</p>
                </div>
                {issue.where_it_appears && (
                  <div>
                    <strong className="text-slate-900">Where it appears</strong>
                    <p>{issue.where_it_appears}</p>
                  </div>
                )}
                {issue.example_improvement && (
                  <div className="rounded-xl bg-brand-50 p-3">
                    <strong className="text-brand-900">Example improvement</strong>
                    <p>{issue.example_improvement}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </article>
  )
}
