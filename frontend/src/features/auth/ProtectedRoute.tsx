import { LoaderCircle, LockKeyhole } from 'lucide-react'
import { Navigate, useLocation, useOutletContext } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/features/auth/auth-context'

export interface ShellContext {
  openAuth: () => void
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { openAuth } = useOutletContext<ShellContext>()
  const location = useLocation()
  if (loading)
    return (
      <div className="grid min-h-[65vh] place-items-center text-brand-600">
        <LoaderCircle className="animate-spin" size={32} />
      </div>
    )
  if (!user)
    return (
      <div className="page-container py-20">
        <EmptyState
          icon={<LockKeyhole />}
          title="Sign in to continue"
          description="Your account keeps analysis results private and makes your resume history available across sessions."
          action={<Button onClick={openAuth}>Sign in or create account</Button>}
        />
      </div>
    )
  if (location.pathname === '/auth/callback') return <Navigate to="/analyze" replace />
  return children
}
