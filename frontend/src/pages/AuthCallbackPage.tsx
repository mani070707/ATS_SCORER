import { LoaderCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { supabase } from '@/lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(() => {
        const next = params.get('next')
        void navigate(next?.startsWith('/') ? next : '/analyze', { replace: true })
      })
      .catch(() => void navigate('/analyze', { replace: true }))
  }, [navigate, params])
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="text-center">
        <LoaderCircle className="mx-auto animate-spin text-brand-600" size={34} />
        <p className="mt-4 font-semibold text-slate-700">Completing sign in…</p>
      </div>
    </div>
  )
}
