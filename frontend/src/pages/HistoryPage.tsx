import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, FileClock, FileText, LoaderCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { buttonStyles } from '@/components/ui/button-styles'
import { AnalysisResults } from '@/features/analysis/AnalysisResults'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { useAuth } from '@/features/auth/auth-context'
import { deleteHistory, getHistory, getHistoryPdf } from '@/lib/api'
import { analysisSchema } from '@/lib/schemas'
import { downloadBlob, formatDate, scoreTone } from '@/lib/utils'

export function HistoryPage() {
  return (
    <ProtectedRoute>
      <History />
    </ProtectedRoute>
  )
}

function History() {
  const { session } = useAuth()
  const token = session?.access_token ?? ''
  const client = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const history = useQuery({
    queryKey: ['history', session?.user.id],
    queryFn: () => getHistory(token),
    enabled: Boolean(token),
  })
  const remove = useMutation({
    mutationFn: (id: string) => deleteHistory(id, token),
    onSuccess: async () => {
      setConfirmId(null)
      await client.invalidateQueries({ queryKey: ['history'] })
    },
    onError: (e) => setError(e.message),
  })
  const download = useMutation({
    mutationFn: async (id: string) => ({ id, blob: await getHistoryPdf(id, token) }),
    onSuccess: ({ id, blob }) => downloadBlob(blob, `ats-report-${id.slice(0, 8)}.pdf`),
    onError: (e) => setError(e.message),
  })
  return (
    <div className="page-container min-h-[70vh] py-10 sm:py-14">
      <p className="eyebrow">Your progress</p>
      <h1 className="page-title">Analysis history</h1>
      <p className="page-subtitle">
        Revisit previous scores, compare improvements and download saved reports.
      </p>
      {error && (
        <p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700" role="alert">
          {error}
        </p>
      )}
      {history.isPending && (
        <div className="grid min-h-72 place-items-center text-brand-600">
          <LoaderCircle className="animate-spin" size={32} />
        </div>
      )}
      {history.error && (
        <EmptyState
          icon={<FileClock />}
          title="History is unavailable"
          description={history.error.message}
          action={<Button onClick={() => void history.refetch()}>Try again</Button>}
        />
      )}
      {history.data?.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={<FileText />}
            title="No analyses yet"
            description="Your completed resume analyses will appear here."
            action={
              <Link to="/analyze" className={buttonStyles()}>
                Analyze a resume
              </Link>
            }
          />
        </div>
      )}
      <div className="mt-8 space-y-4">
        {history.data?.map((item) => {
          const tone = scoreTone(item.ats_score)
          const parsed = analysisSchema.safeParse(item.analysis_result)
          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <span
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl font-bold ${tone.bg} ${tone.color}`}
                >
                  {Math.round(item.ats_score)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold text-slate-950">{item.filename}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(item.created_at)}
                    {item.keyword_match ? ` · ${Math.round(item.keyword_match)}% job match` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => download.mutate(item.id)}
                    disabled={download.isPending}
                  >
                    <Download size={15} />
                    PDF
                  </Button>
                  {parsed.success && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    >
                      {expanded === item.id ? 'Hide details' : 'View details'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600"
                    onClick={() => setConfirmId(item.id)}
                  >
                    <Trash2 size={15} />
                    Delete
                  </Button>
                </div>
              </div>
              {expanded === item.id && parsed.success && (
                <div className="border-t border-slate-100 bg-slate-50 p-4 sm:p-6">
                  <AnalysisResults
                    analysis={parsed.data}
                    onPdf={() => download.mutate(item.id)}
                    pdfLoading={download.isPending}
                  />
                </div>
              )}
            </article>
          )
        })}
      </div>
      {confirmId && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="delete-title" className="text-xl font-bold text-slate-950">
              Delete this analysis?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This removes the saved analysis from your history and cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => remove.mutate(confirmId)}
                disabled={remove.isPending}
              >
                Delete analysis
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
