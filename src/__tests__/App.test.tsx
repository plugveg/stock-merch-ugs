import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { useAuth, ClerkProvider } from "@clerk/clerk-react";

import { useCurrentUser } from "../hooks/useCurrentUser";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock Clerk hook and components
vi.mock("@clerk/clerk-react", async () => {
  const actual = await vi.importActual("@clerk/clerk-react");
  return {
    ...actual,
    useAuth: vi.fn(),
    SignInButton: () => <button>Sign In</button>,
  };
});

// Mock Convex auth components
vi.mock("convex/react", async () => {
  const actual = await vi.importActual("convex/react");
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
vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(() => ({
    isLoading: false,
    isAuthenticated: false,
    userInConvex: null,
  })),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

import App from "../App";
import { ConvexProvider, ConvexReactClient } from "convex/react";

describe("App routing", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      userInConvex: null,
    });
  });

  it("redirects to home if not signed in on RoleProtectedRoute", () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: false });
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      userInConvex: null,
    });

    render(
      <MemoryRouter initialEntries={["/dashboards/admin"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Veuillez vous connecter pour accéder/),
    ).toBeInTheDocument();
  });

  it("renders Home (sign-in) on root route when unauthenticated", () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: false });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Veuillez vous connecter pour accéder/),
    ).toBeInTheDocument();
  });

  it("redirects unauthenticated user from /products to Home", () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: false });

    render(
      <MemoryRouter initialEntries={["/products"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Veuillez vous connecter pour accéder/),
    ).toBeInTheDocument();
  });

  it("allows access to Products for authenticated user", () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: true });
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { id: "user-123" },
    });

    const convex = new ConvexReactClient("http://127.0.0.1:3000");

    render(
      <ClerkProvider publishableKey="pk_test_Y2FyZWZ1bC1jaGlja2VuLTExLmNsZXJrLmFjY291bnRzLmRldiQ">
        <ConvexProvider client={convex}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/products"]}>
              <App />
            </MemoryRouter>
          </QueryClientProvider>
        </ConvexProvider>
      </ClerkProvider>,
    );

    expect(screen.getByText("Inventaire actuel")).toBeInTheDocument();
  });

  it("redirects unknown routes to Home", () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: false });

    render(
      <MemoryRouter initialEntries={["/random"]}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Veuillez vous connecter pour accéder/),
    ).toBeInTheDocument();
  });

  it("renders nothing while auth is loading", () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: false, isSignedIn: false });

    render(
      <MemoryRouter initialEntries={["/products"]}>
        <App />
      </MemoryRouter>,
    );

    // On s'attend à ce qu'aucun contenu ne s'affiche pendant le chargement
    expect(screen.queryByText("Inventaire actuel")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Veuillez vous connecter/),
    ).not.toBeInTheDocument();
  });

  it("allows access to admin dashboard for allowed role", () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: true });
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { role: "Administrator", nickname: "Admin" },
    });

    const convex = new ConvexReactClient("http://127.0.0.1:3000");

    render(
      <ClerkProvider publishableKey="pk_test_Y2FyZWZ1bC1jaGlja2VuLTExLmNsZXJrLmFjY291bnRzLmRldiQ">
        <ConvexProvider client={convex}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/dashboards/admin"]}>
              <App />
            </MemoryRouter>
          </QueryClientProvider>
        </ConvexProvider>
      </ClerkProvider>,
    );

    expect(screen.getByText(/Créer un nouvel événement/i)).toBeInTheDocument();
  });

  it("redirects to dashboards when user role is not allowed", () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: true });
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { role: "Guest", nickname: "GuestUser" },
    });

    const convex = new ConvexReactClient("http://127.0.0.1:3000");

    render(
      <ClerkProvider publishableKey="pk_test_Y2FyZWZ1bC1jaGlja2VuLTExLmNsZXJrLmFjY291bnRzLmRldiQ">
        <ConvexProvider client={convex}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/dashboards/admin"]}>
              <App />
            </MemoryRouter>
          </QueryClientProvider>
        </ConvexProvider>
      </ClerkProvider>,
    );

    // Should be redirected to dashboards route
    expect(
      screen.queryByText(/Créer un nouvel événement/i),
    ).not.toBeInTheDocument();
  });

  it("shows loading when auth is not yet loaded", () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: false, isSignedIn: false });

    render(
      <MemoryRouter initialEntries={["/dashboards/admin"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Chargement...");
  });

  it("redirects to dashboards if user role is undefined", () => {
    (useAuth as Mock).mockReturnValue({ isLoaded: true, isSignedIn: true });
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: null, // pas de rôle
    });

    const convex = new ConvexReactClient("http://127.0.0.1:3000");

    render(
      <ClerkProvider publishableKey="pk_test_Y2FyZWZ1bC1jaGlja2VuLTExLmNsZXJrLmFjY291bnRzLmRldiQ">
        <ConvexProvider client={convex}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/dashboards/admin"]}>
              <App />
            </MemoryRouter>
          </QueryClientProvider>
        </ConvexProvider>
      </ClerkProvider>,
    );

    expect(
      screen.queryByText(/Créer un nouvel événement/i),
    ).not.toBeInTheDocument();
  });
});
