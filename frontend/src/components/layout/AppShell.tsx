import { FileSearch, History, Home, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { AuthModal } from '@/features/auth/AuthModal'
import { useAuth } from '@/features/auth/auth-context'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/analyze', label: 'Analyze', icon: FileSearch },
  { to: '/history', label: 'History', icon: History },
  { to: '/resources', label: 'Resources', icon: null },
]

export function AppShell() {
  const { user, loading, signOut } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="page-container flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold tracking-tight text-slate-950"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white">
              <FileSearch size={19} />
            </span>
            Resume<span className="text-brand-600">Signal</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {loading ? (
              <span className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
            ) : user ? (
              <>
                <span className="max-w-44 truncate text-sm text-slate-600">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => void signOut()}>
                  <LogOut size={16} />
                  Sign out
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setAuthOpen(true)}>
                Sign in
              </Button>
            )}
          </div>
          <button
            className="rounded-lg p-2 md:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileOpen && (
          <nav
            className="border-t border-slate-100 bg-white p-4 md:hidden"
            aria-label="Mobile navigation"
          >
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700',
                  )
                }
              >
                {Icon && <Icon size={18} />}
                {label}
              </NavLink>
            ))}
            <div className="mt-3 border-t pt-3">
              {user ? (
                <Button className="w-full" variant="secondary" onClick={() => void signOut()}>
                  Sign out
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => {
                    setAuthOpen(true)
                    setMobileOpen(false)
                  }}
                >
                  Sign in
                </Button>
              )}
            </div>
          </nav>
        )}
      </header>
      <main>
        <Outlet context={{ openAuth: () => setAuthOpen(true) }} />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="page-container flex flex-col gap-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ResumeSignal. Build a resume that gets read.</p>
          <div className="flex gap-5">
            <Link to="/resources">ATS guide</Link>
          </div>
        </div>
      </footer>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} returnTo={location.pathname} />
    </div>
  )
}
