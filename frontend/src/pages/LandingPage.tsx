import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileSearch,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/button-styles'
import type { ShellContext } from '@/features/auth/ProtectedRoute'
import { useAuth } from '@/features/auth/auth-context'

const scoreCards = [
  ['Formatting', '20'],
  ['Keywords', '25'],
  ['Content', '25'],
  ['Skill evidence', '15'],
  ['ATS compatibility', '15'],
]

export function LandingPage() {
  const { user } = useAuth()
  const { openAuth } = useOutletContext<ShellContext>()
  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="hero-grid absolute inset-0 opacity-50" />
        <div className="page-container relative grid min-h-[680px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Sparkles size={14} />
              Practical, evidence-based feedback
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-.045em] text-slate-950 sm:text-6xl">
              Know what your resume <span className="text-brand-600">signals</span> before you
              apply.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              See how ATS software reads your resume, where it loses relevance, and which changes
              can make the biggest difference.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <Link to="/analyze" className={buttonStyles('primary', 'lg')}>
                  Analyze your resume <ArrowRight size={18} />
                </Link>
              ) : (
                <Button size="lg" onClick={openAuth}>
                  Get your free analysis <ArrowRight size={18} />
                </Button>
              )}
              <Link to="/resources" className={buttonStyles('secondary', 'lg')}>
                Explore the ATS guide
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={16} />
                PDF, DOC and DOCX
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={16} />
                5-part score
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={16} />
                Actionable fixes
              </span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-12 rounded-full bg-brand-200/40 blur-3xl" />
            <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_35px_90px_-35px_rgba(30,27,75,.35)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                    <FileSearch />
                  </span>
                  <div>
                    <strong className="block text-sm text-slate-950">
                      product-designer-resume.pdf
                    </strong>
                    <span className="text-xs text-slate-400">Analysis complete</span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Strong
                </span>
              </div>
              <div className="grid gap-5 py-6 sm:grid-cols-[140px_1fr]">
                <div className="grid h-32 w-32 place-items-center rounded-full border-[10px] border-brand-500 bg-brand-50">
                  <span className="text-center">
                    <strong className="text-4xl text-slate-950">78</strong>
                    <small className="block text-slate-500">ATS score</small>
                  </span>
                </div>
                <div className="space-y-3">
                  {scoreCards.map(([label, value], i) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">{label}</span>
                        <strong>
                          {Number(value) - (i % 3)}/{value}
                        </strong>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${84 - i * 4}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4 text-white">
                <div className="flex gap-3">
                  <ScanSearch className="shrink-0 text-indigo-300" />
                  <div>
                    <strong className="text-sm">Highest-impact improvement</strong>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      Add measurable outcomes to two recent experience bullets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="page-container py-20">
        <div className="text-center">
          <p className="eyebrow">A useful score, not a mystery number</p>
          <h2 className="section-title mx-auto max-w-2xl">Understand exactly what to improve.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <Feature
            icon={<BarChart3 />}
            title="Clear scoring"
            copy="See five weighted dimensions, not a vague single score."
          />
          <Feature
            icon={<ShieldCheck />}
            title="Skill validation"
            copy="Learn which skills are supported by real project and work evidence."
          />
          <Feature
            icon={<Sparkles />}
            title="Prioritized guidance"
            copy="Focus first on changes with the greatest likely ATS impact."
          />
        </div>
      </section>
      <section className="bg-slate-950 py-20 text-white">
        <div className="page-container grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-indigo-300">How it works</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              From upload to action plan in three steps.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-300">
              Analysis combines document parsing, language models, semantic matching and transparent
              scoring rules.
            </p>
          </div>
          <ol className="space-y-5">
            {[
              ['01', 'Upload your resume', 'Choose a supported document up to 5 MB.'],
              ['02', 'Add the role', 'Paste a job description when you want targeted matching.'],
              ['03', 'Work the priorities', 'Review strengths, gaps, examples and next actions.'],
            ].map(([number, title, copy]) => (
              <li
                key={number}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <span className="font-mono text-sm text-indigo-300">{number}</span>
                <div>
                  <strong>{title}</strong>
                  <p className="mt-1 text-sm text-slate-400">{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="page-container py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="icon-box">
                <LockKeyhole />
              </span>
              <h2 className="mt-5 text-3xl font-bold text-slate-950">
                Built with honest privacy expectations.
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Your uploaded document is processed for analysis and is not intentionally stored as
                a source file. Parsed data uses Groq for structured extraction and Supabase for
                account history.
              </p>
            </div>
            <Link to="/resources" className={buttonStyles('secondary')}>
              Read the ATS guide <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function Feature({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <article className="card">
      <span className="icon-box">{icon}</span>
      <h3 className="mt-5 text-xl font-bold text-slate-950">{title}</h3>
      <p className="mt-2 leading-7 text-slate-600">{copy}</p>
    </article>
  )
}
