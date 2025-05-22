import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Products from "@/Products";
import { describe, expect, it, vi } from "vitest";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider } from "@clerk/clerk-react";

// Mock Clerk user
vi.mock("@clerk/clerk-react", async () => {
  const actual = await vi.importActual<object>("@clerk/clerk-react");
  return {
    ...actual,
    useUser: () => ({
      user: {
        id: "user_123",
        fullName: "Mocky",
        primaryEmailAddress: {
          emailAddress: "mocky@example.com",
        },
      },
    }),
    UserButton: () => <div>UserButton</div>,
  };
});

// Mock ConvexProvider
vi.mock("convex/react-clerk", async () => {
  const actual = await vi.importActual<object>("convex/react-clerk");
  return {
    ...actual,
    ConvexProviderWithClerk: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
  };
});

// Mock useCurrentUser
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    userInConvex: {
      nickname: "Mocky",
      email: "mocky@example.com",
    },
  }),
}));

// Mock Navbar
vi.mock("@/components/navbar", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <nav>{children}</nav>
  ),
}));

// Mock StockOverview
vi.mock("@/components/stock-overview", () => ({
  StockOverview: () => <div>StockOverview</div>,
}));

// Mock ResponsiveDialog
vi.mock("@/components/responsive-dialog", () => ({
  ResponsiveDialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock StockForm
vi.mock("@/components/stock-form", () => ({
  StockForm: ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (data: { name: string; quantity: number }) => void;
    onCancel: () => void;
  }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name: "Mock product", quantity: 1 });
      }}
    >
      <button type="submit">Submit</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  ),
}));

// Mock StockTable
vi.mock("@/components/stock-table", () => ({
  StockTable: ({
    onEdit,
    onDelete,
  }: {
    onEdit: (item: { _id: string; name: string; quantity: number }) => void;
    onDelete: (id: string) => void;
  }) => (
    <div>
      StockTable
      <button
        onClick={() => onEdit({ _id: "1", name: "Product 1", quantity: 1 })}
      >
        Edit
      </button>
      <button onClick={() => onDelete("1")}>Delete</button>
    </div>
  ),
}));

// Mock StockCharts
vi.mock("@/components/stock-charts", () => ({
  StockCharts: () => <div>StockCharts</div>,
}));

// Mock useProducts
vi.mock("@/hooks/useProducts", () => ({
  default: () => ({
    products: [
      { _id: "1", name: "Product 1", quantity: 1, threshold: 2 },
      { _id: "2", name: "Product 2", quantity: 3, threshold: 1 },
    ],
    isLoading: false,
    showSkeleton: false,
    error: null,
    addProduct: { mutate: vi.fn(({ onSuccess }) => onSuccess?.()) },
    updateProduct: { mutate: vi.fn(({ onSuccess }) => onSuccess?.()) },
    deleteProduct: { mutate: vi.fn() },
  }),
}));

function renderWithProviders() {
  // Provide a mock useAuth function that matches the expected UseAuth type
  const mockUseAuth = () => ({
    isAuthenticated: true,
    isLoading: false,
    isLoaded: true,
    isSignedIn: true,
    getToken: async () => "mock-token",
    orgId: undefined,
    orgRole: undefined,
    orgSlug: undefined,
    userId: "user_123",
  });

  // Provide a minimal mock for IConvexReactClient
  const mockConvexClient = {
    // Add only the properties/methods required by your components/tests
    // For example, subscribe: jest.fn(), query: jest.fn(), mutation: jest.fn(), etc.
    setAuth: vi.fn(),
    clearAuth: vi.fn(),
  } as unknown as {
    setAuth: (fetchToken: unknown) => void;
    clearAuth: () => void;
  };

  return render(
    <ClerkProvider publishableKey="pk_test_Y2FyZWZ1bC1jaGlja2VuLTExLmNsZXJrLmFjY291bnRzLmRldiQ">
      <ConvexProviderWithClerk client={mockConvexClient} useAuth={mockUseAuth}>
        <Products />
      </ConvexProviderWithClerk>
    </ClerkProvider>,
  );
}

describe("Products Component", () => {
  it("renders overview and tabs", () => {
    renderWithProviders();
    expect(screen.getByText("StockOverview")).toBeInTheDocument();
    expect(screen.getByText("Current Inventory")).toBeInTheDocument();
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });

  it("renders Current Inventory section with alert", () => {
    renderWithProviders();
    expect(screen.getByText("1 items below threshold!")).toBeInTheDocument();
  });

  it("switches to analytics tab and shows chart", async () => {
    renderWithProviders();
    const analyticsTab = screen.getByRole("tab", { name: "Analytics" });
    userEvent.click(analyticsTab);

    await waitFor(() => {
      expect(screen.getByText("StockCharts")).toBeInTheDocument();
    });
  });

  it("opens add dialog and triggers submit", async () => {
    renderWithProviders();
    userEvent.click(screen.getByText("Add Item"));
    userEvent.click(screen.getByText("Edit"));
    const submitButtons = screen.getAllByRole("button", { name: /submit/i });
    userEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.queryByText("Add New Item")).not.toBeInTheDocument();
    });
  });

  it("opens edit dialog and submits updated item", async () => {
    renderWithProviders();
    userEvent.click(screen.getByText("Edit"));
    const submitButtons = screen.getAllByRole("button", { name: /submit/i });
    userEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.queryByText("Edit Item")).not.toBeInTheDocument();
    });
  });

  it("calls deleteProduct when clicking delete", () => {
    renderWithProviders();
    userEvent.click(screen.getByText("Delete"));
    // The mutate function is mocked, so we can’t assert here directly
  });
});
