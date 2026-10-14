import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LandingPage } from './LandingPage'

vi.mock('@/providers/auth-context', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signInWithGoogle: vi.fn(),
    signInWithMagicLink: vi.fn(),
    signOut: vi.fn(),
  }),
}))

describe('LandingPage', () => {
  it('renders the hero and points the primary CTA to sign-in', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /conversations that flow/i }),
    ).toBeInTheDocument()

    const ctas = screen.getAllByRole('link', { name: /start chatting/i })
    expect(ctas.length).toBeGreaterThan(0)
    expect(ctas[0]).toHaveAttribute('href', '/login')
  })

  it('shows the feature highlights', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Realtime messaging')).toBeInTheDocument()
    expect(screen.getByText('Presence & typing')).toBeInTheDocument()
  })
})
