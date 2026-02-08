import '@testing-library/jest-dom'
import { describe, it, vi, expect, beforeEach, Mock } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useCurrentUser } from '../hooks/useCurrentUser'
import App from '../Home'
import { MemoryRouter } from 'react-router'
import React from 'react'

// Mocks de Clerk et Convex
vi.mock('@clerk/clerk-react', async () => {
  const actual = await vi.importActual('@clerk/clerk-react')
  type ChildrenProps = React.PropsWithChildren<object>
  return {
    ...actual,
    SignInButton: ({ children }: ChildrenProps) => <button>{children}</button>,
    UserButton: () => <div>UserMenu</div>,
  }
})

vi.mock('convex/react', async () => {
  type ChildrenProps = React.PropsWithChildren<object>
  return {
    Authenticated: ({ children }: ChildrenProps) => <>{children}</>,
    Unauthenticated: ({ children }: ChildrenProps) => <>{children}</>,
    AuthLoading: ({ children }: ChildrenProps) => <>{children}</>,
  }
})

vi.mock('../hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))

describe('Home Component', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders loading state when isLoading is true', () => {
    ;(useCurrentUser as Mock).mockReturnValue({
      isLoading: true,
    })

    render(<App />)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('renders SignIn page when unauthenticated', () => {
    ;(useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    })

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText(/Veuillez vous connecter pour accéder aux fonctionnalités/)).toBeInTheDocument()
  })

  it('renders main content when authenticated', () => {
    ;(useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { email: 'test@example.com' },
    })

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(
      screen.getByText('Bienvenue sur notre plateforme de gestion de produits pour UGS, les associations et les particuliers !')
    ).toBeInTheDocument()
    expect(screen.getByText(/connecté en tant que\s+test@example\.com/i)).toBeInTheDocument()
  })
})
