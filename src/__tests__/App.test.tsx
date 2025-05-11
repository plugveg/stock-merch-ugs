import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";
import * as useCurrentUserHook from "../hooks/useCurrentUser";
import * as useTasksHook from "../hooks/useTasks";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Id } from "../../convex/_generated/dataModel";
import "@testing-library/jest-dom";

// On mocke les hooks personnalisés
vi.mock("./hooks/useCurrentUser");
vi.mock("./hooks/useTasks");

// On mocke les composants de convex/react pour ne rendre que leurs enfants
vi.mock("convex/react", () => ({
  AuthLoading: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-loading">{children}</div>
  ),
  Authenticated: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="authenticated">{children}</div>
  ),
  Unauthenticated: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="unauthenticated">{children}</div>
  ),
}));

// On mocke Clerk pour éviter d’avoir à initialiser leur contexte
vi.mock("@clerk/clerk-react", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
  UserButton: () => <div>UserButton</div>,
}));

describe("App component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("displays the loading screen when isLoading is true", () => {
    vi.spyOn(useCurrentUserHook, "useCurrentUser").mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      userInConvex: null,
    });
    render(<App />);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
    expect(screen.queryByTestId("authenticated")).not.toBeInTheDocument();
    expect(screen.queryByTestId("unauthenticated")).not.toBeInTheDocument();
  });

  it("displays login screen when unauthenticated", () => {
    vi.spyOn(useCurrentUserHook, "useCurrentUser").mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      userInConvex: null,
    });
    render(<App />);
    expect(
      screen.getByText(
        "Veuillez vous connecter pour accéder aux fonctionnalités de l'application ! Authentification faite avec Clerk et Convex.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Se connecter" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("authenticated")).not.toBeInTheDocument();
  });

  it("displays protected content when authenticated", () => {
    vi.spyOn(useCurrentUserHook, "useCurrentUser").mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: {
        nickname: "Alice",
        email: "alice@example.com",
        _id: { __tableName: "users", id: "user-123" } as unknown as Id<"users">,
        _creationTime: 0,
        externalId: "",
        role: "Administrator",
      },
    });
    vi.spyOn(useTasksHook, "useTasks").mockReturnValue({
      tasks: [
        {
          text: "Test Task",
          isCompleted: false,
          _id: {
            __tableName: "tasks",
            id: "task-123",
          } as unknown as Id<"tasks">,
          _creationTime: 0,
        },
      ],
      isLoading: false,
      showSkeleton: false,
      error: null,
      refetchTasks: vi.fn(),
    });
    render(<App />);
    expect(screen.getByTestId("authenticated")).toBeInTheDocument();
    // Vérifie qu'on voit bien le titre de la page protégée
    expect(screen.getByText("Welcome to Our Platform")).toBeInTheDocument();
    // Vérifie qu'une tâche est bien rendue
    expect(screen.getByText("Test Task - Pending")).toBeInTheDocument();
  });

  it("increments the counter when the button is clicked", () => {
    vi.spyOn(useCurrentUserHook, "useCurrentUser").mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: {
        _id: {
          __tableName: "users",
          id: "user-123",
        } as unknown as Id<"users">,
        _creationTime: 0,
        email: "",
        externalId: "",
        role: "Administrator",
      },
    });
    vi.spyOn(useTasksHook, "useTasks").mockReturnValue({
      tasks: [],
      isLoading: false,
      showSkeleton: false,
      error: null,
      refetchTasks: () => {},
    });
    render(<App />);
    // Le compteur commence à 0
    expect(screen.getByText("0")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Increment Counter" });
    fireEvent.click(button);
    // Après un clic, il affiche 1
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("displays skeleton when showSkeleton is true", () => {
    vi.spyOn(useCurrentUserHook, "useCurrentUser").mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: {
        nickname: "Bob",
        _id: { __tableName: "users", id: "user-456" } as unknown as Id<"users">,
        _creationTime: 0,
        email: "",
        externalId: "",
        role: "Administrator",
      },
    });
    vi.spyOn(useTasksHook, "useTasks").mockReturnValue({
      tasks: [],
      isLoading: true,
      showSkeleton: true,
      error: null,
      refetchTasks: vi.fn(),
    });
    render(<App />);
    const skeletonItems = screen.getAllByRole("listitem");
    expect(skeletonItems).toHaveLength(3);
  });

  it("displays error message when error exists", () => {
    vi.spyOn(useCurrentUserHook, "useCurrentUser").mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: {
        nickname: "Carol",
        _id: { __tableName: "users", id: "user-789" } as unknown as Id<"users">,
        _creationTime: 0,
        email: "",
        externalId: "",
        role: "Administrator",
      },
    });
    const error = new Error("Oops");
    vi.spyOn(useTasksHook, "useTasks").mockReturnValue({
      tasks: [],
      isLoading: false,
      showSkeleton: false,
      error,
      refetchTasks: vi.fn(),
    });
    render(<App />);
    expect(screen.getByText("Error: Oops")).toBeInTheDocument();
  });

  it("displays 'Completed' when task.isCompleted is true", () => {
    vi.spyOn(useCurrentUserHook, "useCurrentUser").mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      userInConvex: {
        nickname: "Dave",
        _id: { __tableName: "users", id: "user-999" } as unknown as Id<"users">,
        _creationTime: 0,
        email: "",
        externalId: "",
        role: "Administrator",
      },
    });
    vi.spyOn(useTasksHook, "useTasks").mockReturnValue({
      tasks: [
        {
          _id: { __tableName: "tasks", id: "task-1" } as unknown as Id<"tasks">,
          text: "Done Task",
          isCompleted: true,
          _creationTime: 0,
        },
      ],
      isLoading: false,
      showSkeleton: false,
      error: null,
      refetchTasks: vi.fn(),
    });
    render(<App />);
    expect(screen.getByText("Done Task - Completed")).toBeInTheDocument();
  });
});
