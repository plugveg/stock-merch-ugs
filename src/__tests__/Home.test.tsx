import "@testing-library/jest-dom";
import { describe, it, vi, expect, beforeEach, Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTasks } from "../hooks/useTasks";
import App from "../Home";
import { MemoryRouter } from "react-router";
import React from "react";

// Mocks de Clerk et Convex
vi.mock("@clerk/clerk-react", async () => {
  const actual = await vi.importActual("@clerk/clerk-react");
  type ChildrenProps = React.PropsWithChildren<object>;
  return {
    ...actual,
    SignInButton: ({ children }: ChildrenProps) => <button>{children}</button>,
    UserButton: () => <div>UserMenu</div>,
  };
});

vi.mock("convex/react", async () => {
  type ChildrenProps = React.PropsWithChildren<object>;
  return {
    Authenticated: ({ children }: ChildrenProps) => <>{children}</>,
    Unauthenticated: ({ children }: ChildrenProps) => <>{children}</>,
    AuthLoading: ({ children }: ChildrenProps) => <>{children}</>,
  };
});

vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock("../hooks/useTasks", () => ({
  useTasks: vi.fn(),
}));

const mockTasks = [
  { _id: "1", text: "Task 1", isCompleted: false },
  { _id: "2", text: "Task 2", isCompleted: true },
];

describe("Home Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders loading state when isLoading is true", () => {
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: true,
    });

    render(<App />);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("renders SignIn page when unauthenticated", () => {
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(
        /Veuillez vous connecter pour accéder aux fonctionnalités/,
      ),
    ).toBeInTheDocument();
  });

  it("renders main content when authenticated", () => {
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { email: "test@example.com" },
    });
    (useTasks as Mock).mockReturnValue({
      isLoading: false,
      showSkeleton: false,
      error: null,
      tasks: mockTasks,
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText("Welcome to Our Platform")).toBeInTheDocument();
    expect(
      screen.getByText(/connecté en tant que\s+test@example\.com/i),
    ).toBeInTheDocument();
  });

  it("increments counter on button click", () => {
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { nickname: "TestUser" },
    });
    (useTasks as Mock).mockReturnValue({
      isLoading: false,
      showSkeleton: false,
      error: null,
      tasks: mockTasks,
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    const button = screen.getByText("Increment Counter");
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders skeletons when showSkeleton is true", () => {
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { nickname: "TestUser" },
    });
    (useTasks as Mock).mockReturnValue({
      isLoading: false,
      showSkeleton: true,
      error: null,
      tasks: [],
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole("list")[0].children.length).toBeGreaterThan(0);
  });

  it("renders error message when error is returned", () => {
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { nickname: "TestUser" },
    });
    (useTasks as Mock).mockReturnValue({
      isLoading: false,
      showSkeleton: false,
      error: { message: "Failed to fetch" },
      tasks: [],
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Error: Failed to fetch/)).toBeInTheDocument();
  });

  it("renders tasks when loaded", () => {
    (useCurrentUser as Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: { nickname: "TestUser" },
    });
    (useTasks as Mock).mockReturnValue({
      isLoading: false,
      showSkeleton: false,
      error: null,
      tasks: mockTasks,
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Task 1 - Pending/)).toBeInTheDocument();
    expect(screen.getByText(/Task 2 - Completed/)).toBeInTheDocument();
  });
});
