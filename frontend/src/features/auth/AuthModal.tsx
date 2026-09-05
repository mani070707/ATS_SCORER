import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, LockKeyhole, Mail, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { authFormSchema, type AuthFormValues } from '@/lib/schemas'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export function AuthModal({
  open,
  onClose,
  returnTo = '/analyze',
}: {
  open: boolean
  onClose: () => void
  returnTo?: string
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({ resolver: zodResolver(authFormSchema) })

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [onClose, open])

  if (!open) return null

  const submit = async (values: AuthFormValues) => {
    setError('')
    setMessage('')
    if (!isSupabaseConfigured) {
      setError('Authentication is not configured. Add the Vite Supabase environment values.')
      return
    }
    const result =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword(values)
        : await supabase.auth.signUp({
            ...values,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
            },
          })
    if (result.error) {
      setError(result.error.message)
      return
    }
    if (mode === 'signup' && !result.data.session) {
      setMessage('Check your inbox to confirm your account, then return here to sign in.')
      reset()
      return
    }
    onClose()
  }

  const googleSignIn = async () => {
    setError('')
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (oauthError) setError(oauthError.message)
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Secure workspace</p>
            <h2 id="auth-title" className="mt-2 text-2xl font-bold text-slate-950">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Save analyses and return to your progress anytime.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close authentication dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist">
          {(['signin', 'signup'] as const).map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={mode === item}
              onClick={() => {
                setMode(item)
                setError('')
                setMessage('')
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === item ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
            >
              {item === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>
        <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(submit)(e)} noValidate>
          <label className="field-label">
            <span>Email address</span>
            <span className="field-wrap">
              <Mail size={17} />
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
              />
            </span>
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </label>
          <label className="field-label">
            <span>Password</span>
            <span className="field-wrap">
              <LockKeyhole size={17} />
              <input
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                placeholder="At least 6 characters"
                {...register('password')}
              />
            </span>
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </label>
          {error && (
            <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700" role="status">
              {message}
            </p>
          )}
          <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin" size={18} />}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          OR
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <Button className="w-full" variant="secondary" onClick={() => void googleSignIn()}>
          Continue with Google
        </Button>
        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          Your resume is processed by our analysis partners and results are saved securely to your
          account.
        </p>
      </div>
    </div>
  )
}
