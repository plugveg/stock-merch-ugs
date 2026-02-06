import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useAuth } from '@clerk/clerk-react';

import { useCurrentUser } from '../hooks/useCurrentUser';

// Mock Clerk hook and components
vi.mock('@clerk/clerk-react', async () => {
  const actual = await vi.importActual('@clerk/clerk-react');
  return {
    ...actual,
    useAuth: vi.fn(),
    SignInButton: () => <button>Sign In</button>,
  };
});

// Mock Convex auth components
vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react');
  type ChildrenProps = React.PropsWithChildren<object>;
  return {
    ...actual,
    AuthLoading: ({ children }: ChildrenProps) => (
      <div data-testid="auth-loading">{children}</div>
    ),
    Authenticated: ({ children }: ChildrenProps) => (
      <div data-testid="authenticated">{children}</div>
    ),
    Unauthenticated: ({ children }: ChildrenProps) => (
      <div data-testid="unauthenticated">{children}</div>
    ),
    ConvexReactClient: actual.ConvexReactClient,
  };
});

// Mock custom hooks
vi.mock('../hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(() => ({
    isLoading: false,
    isAuthenticated: false,
    userInConvex: null,
  })),
}));

// Mock route components so routing tests don't depend on heavy page internals.
vi.mock('../Home', () => ({
  default: () => <div>Veuillez vous connecter pour accéder</div>,
}));
vi.mock('../Products', () => ({
  default: () => <div>Inventaire actuel</div>,
}));
vi.mock('../Dashboards', () => ({
  default: () => <div>Sélectionnez un tableau de bord</div>,
}));
vi.mock('../AdminDashboard', () => ({
  default: () => <div>Créer un nouvel événement</div>,
}));
vi.mock('../UserDashboard', () => ({
  default: () => <div>Dashboard Utilisateur</div>,
}));

import App from '../App';

describe('App routing', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      userInConvex: null,
    });
  });

  it('redirects to home if not signed in on RoleProtectedRoute', async () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: false });
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      userInConvex: null,
    });

    render(
      <MemoryRouter initialEntries={['/dashboards/admin']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Veuillez vous connecter pour accéder/),
    ).toBeInTheDocument();
  });

  it('renders Home (sign-in) on root route when unauthenticated', async () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: false });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Veuillez vous connecter pour accéder/),
    ).toBeInTheDocument();
  });

  it('redirects unauthenticated user from /products to Home', async () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: false });

    render(
      <MemoryRouter initialEntries={['/products']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Veuillez vous connecter pour accéder/),
    ).toBeInTheDocument();
  });

  it('allows access to Products for authenticated user', async () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: true });
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { id: 'user-123' },
    });

    render(
      <MemoryRouter initialEntries={['/products']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Inventaire actuel')).toBeInTheDocument();
  });

  it('redirects unknown routes to Home', async () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: false });

    render(
      <MemoryRouter initialEntries={['/random']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Veuillez vous connecter pour accéder/),
    ).toBeInTheDocument();
  });

  it('renders nothing while auth is loading', () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: false, isSignedIn: false });

    render(
      <MemoryRouter initialEntries={['/products']}>
        <App />
      </MemoryRouter>,
    );

    // On s'attend à ce qu'aucun contenu ne s'affiche pendant le chargement
    expect(screen.queryByText('Inventaire actuel')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Veuillez vous connecter/),
    ).not.toBeInTheDocument();
  });

  it('allows access to admin dashboard for allowed role', async () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: true });
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { role: 'Administrator', nickname: 'Admin' },
    });

    render(
      <MemoryRouter initialEntries={['/dashboards/admin']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Créer un nouvel événement/i),
    ).toBeInTheDocument();
  });

  it('redirects to dashboards when user role is not allowed', async () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: true });
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { role: 'Guest', nickname: 'GuestUser' },
    });

    render(
      <MemoryRouter initialEntries={['/dashboards/admin']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Sélectionnez un tableau de bord/i),
    ).toBeInTheDocument();
  });

  it('shows loading when auth is not yet loaded', () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: false, isSignedIn: false });

    render(
      <MemoryRouter initialEntries={['/dashboards/admin']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Chargement...');
  });

  it('redirects to dashboards if user role is undefined', async () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: true });
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: null, // pas de rôle
    });

    render(
      <MemoryRouter initialEntries={['/dashboards/admin']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Sélectionnez un tableau de bord/i),
    ).toBeInTheDocument();
  });
});
