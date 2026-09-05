import { useMutation } from '@tanstack/react-query'
import { FileCheck2, FileUp, LoaderCircle, ShieldCheck, Sparkles, Target, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { AnalysisResults } from '@/features/analysis/AnalysisResults'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { useAuth } from '@/features/auth/auth-context'
import { analyzeResume, generatePdf } from '@/lib/api'
import { type Analysis, validateResume } from '@/lib/schemas'
import { cn, downloadBlob } from '@/lib/utils'

export function AnalyzePage() {
  return (
    <ProtectedRoute>
      <Analyzer />
    </ProtectedRoute>
  )
}

function Analyzer() {
  const { session } = useAuth()
  const [mode, setMode] = useState<'general' | 'jd'>('general')
  const [file, setFile] = useState<File>()
  const [fileError, setFileError] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [progress, setProgress] = useState(0)
  const token = session?.access_token ?? ''
  const analyze = useMutation({
    mutationFn: () =>
      analyzeResume(file as File, mode === 'jd' ? jobDescription.trim() : '', token),
    onSuccess: setAnalysis,
  })
  const pdf = useMutation({
    mutationFn: () => generatePdf(analysis as Analysis, token),
    onSuccess: (blob) => downloadBlob(blob, 'ats-resume-report.pdf'),
  })

  useEffect(() => {
    if (!analyze.isPending) {
      setProgress(0)
      return
    }
    setProgress(10)
    const timer = window.setInterval(
      () => setProgress((value) => Math.min(92, value + (value < 55 ? 8 : 3))),
      900,
    )
    return () => clearInterval(timer)
  }, [analyze.isPending])

  const submit = () => {
    const error = validateResume(file)
    setFileError(error ?? '')
    if (error) return
    if (mode === 'jd' && jobDescription.trim().length < 50) {
      setFileError('Add at least 50 characters from the job description')
      return
    }
    setAnalysis(null)
    analyze.mutate()
  }

  return (
    <div className="page-container py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="eyebrow">Resume workspace</p>
        <h1 className="page-title">Turn your resume into a stronger signal.</h1>
        <p className="page-subtitle">
          Upload your resume and get a prioritized, evidence-based ATS review. Add a job description
          for role-specific guidance.
        </p>
      </div>
      <section
        className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-8"
        aria-label="Resume analysis form"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              key: 'general',
              icon: ShieldCheck,
              title: 'General ATS review',
              copy: 'Score structure, content and readability.',
            },
            {
              key: 'jd',
              icon: Target,
              title: 'Match a job',
              copy: 'Compare skills and keywords to a role.',
            },
          ].map(({ key, icon: Icon, title, copy }) => (
            <button
              key={key}
              onClick={() => setMode(key as 'general' | 'jd')}
              className={cn(
                'flex gap-3 rounded-2xl border p-4 text-left transition',
                mode === key
                  ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                  : 'border-slate-200 hover:border-slate-300',
              )}
            >
              <span
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                  mode === key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600',
                )}
              >
                <Icon size={20} />
              </span>
              <span>
                <strong className="block text-slate-950">{title}</strong>
                <small className="mt-1 block leading-5 text-slate-500">{copy}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <label
              htmlFor="resume"
              className={cn(
                'group flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition hover:border-brand-400 hover:bg-brand-50/40',
                file ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-300',
              )}
            >
              <input
                id="resume"
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const next = e.target.files?.[0]
                  setFile(next)
                  setFileError(validateResume(next) ?? '')
                }}
              />
              {file ? (
                <>
                  <FileCheck2 className="text-emerald-600" size={34} />
                  <strong className="mt-3 max-w-full truncate text-slate-950">{file.name}</strong>
                  <span className="mt-1 text-sm text-slate-500">
                    {(file.size / 1024).toFixed(0)} KB · ready to analyze
                  </span>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-600"
                    onClick={(e) => {
                      e.preventDefault()
                      setFile(undefined)
                    }}
                  >
                    <X size={15} />
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <FileUp className="text-brand-600" size={34} />
                  <strong className="mt-3 text-slate-950">Drop your resume here</strong>
                  <span className="mt-1 text-sm text-slate-500">
                    or click to browse · PDF, DOC, DOCX · 5 MB max
                  </span>
                </>
              )}
            </label>
          </div>
          <div className={cn(mode !== 'jd' && 'opacity-55')}>
            <label htmlFor="jd" className="text-sm font-semibold text-slate-800">
              Job description{' '}
              <span className="font-normal text-slate-400">
                {mode === 'jd' ? '(required)' : '(optional)'}
              </span>
            </label>
            <textarea
              id="jd"
              disabled={mode !== 'jd'}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the responsibilities, requirements and skills from the job posting…"
              className="mt-2 min-h-56 w-full resize-y rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {jobDescription.length} characters
            </p>
          </div>
        </div>
        {fileError && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {fileError}
          </p>
        )}
        {analyze.error && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {analyze.error.message}
          </p>
        )}
        <button
          onClick={submit}
          disabled={analyze.isPending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-4 font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-70"
        >
          {analyze.isPending ? (
            <>
              <LoaderCircle className="animate-spin" />
              Analyzing your resume…
            </>
          ) : (
            <>
              <Sparkles size={19} />
              Analyze resume
            </>
          )}
        </button>
        {analyze.isPending && (
          <div className="mt-4" role="status">
            <div className="flex justify-between text-xs text-slate-500">
              <span>
                {progress < 35
                  ? 'Reading your resume'
                  : progress < 70
                    ? 'Evaluating ATS signals'
                    : 'Preparing recommendations'}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </section>
      {analysis && (
        <AnalysisResults
          analysis={analysis}
          onPdf={() => pdf.mutate()}
          pdfLoading={pdf.isPending}
          pdfError={pdf.error?.message}
        />
      )}
    </div>
  )
}
