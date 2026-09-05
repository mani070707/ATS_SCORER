import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AuthModal } from '@/features/auth/AuthModal'

describe('AuthModal', () => {
  it('validates sign-in fields accessibly', async () => {
    const user = userEvent.setup()
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AuthModal open onClose={vi.fn()} />
      </QueryClientProvider>,
    )
    await user.type(screen.getByLabelText(/email address/i), 'invalid')
    await user.type(screen.getByLabelText(/password/i), '123')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
    expect(screen.getByText(/at least 6/i)).toBeInTheDocument()
  })
})
