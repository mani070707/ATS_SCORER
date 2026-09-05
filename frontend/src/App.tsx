import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'

const AnalyzePage = lazy(() =>
  import('@/pages/AnalyzePage').then((module) => ({ default: module.AnalyzePage })),
)
const AuthCallbackPage = lazy(() =>
  import('@/pages/AuthCallbackPage').then((module) => ({ default: module.AuthCallbackPage })),
)
const HistoryPage = lazy(() =>
  import('@/pages/HistoryPage').then((module) => ({ default: module.HistoryPage })),
)
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((module) => ({ default: module.LandingPage })),
)
const ResourcesPage = lazy(() =>
  import('@/pages/ResourcesPage').then((module) => ({ default: module.ResourcesPage })),
)

export function App() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center text-sm font-semibold text-brand-600">
          Loading ResumeSignal…
        </div>
      }
    >
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<LandingPage />} />
          <Route path="analyze" element={<AnalyzePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<LandingPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
