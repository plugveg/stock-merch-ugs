// /src/__tests__/UserDashboard.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import UserDashboard from "../UserDashboard";
import { MemoryRouter } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { useCurrentUser } from "../hooks/useCurrentUser";

// Mock hooks and modules
vi.mock("convex/react");
vi.mock("../hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));
vi.mock("../components/navbar", () => ({
  default: () => <div>NavBar</div>,
}));
vi.mock("../components/footer", () => ({
  default: () => <div>Footer</div>,
}));
vi.mock("../components/stock-form", () => ({
  StockForm: ({ onSubmit }: { onSubmit: (data: unknown) => void }) => (
    <button onClick={() => onSubmit({ productName: "FakeProduct" })}>
      Submit Mock Product
    </button>
  ),
}));
vi.mock("../components/responsive-dialog", () => ({
  ResponsiveDialog: ({
    open,
    children,
  }: {
    open: boolean;
    children: React.ReactNode;
  }) => (open ? children : null),
}));

describe("UserDashboard", () => {
  const mockMutation = vi.fn();
  const mockUser = {
    _id: "user1",
    nickname: "TestUser",
    role: "Member",
    email: "test@example.com",
  };

  beforeEach(() => {
    (useCurrentUser as Mock).mockReturnValue({ userInConvex: mockUser });
    (useMutation as Mock).mockReturnValue(() => mockMutation());
    (useQuery as Mock).mockImplementation((queryFn: { name: string }) => {
      if (queryFn.name === "listMyProducts") {
        return [
          {
            _id: "p1",
            productName: "Product 1",
            description: "Desc 1",
            purchasePrice: 10.5,
          },
        ];
      }
      if (queryFn.name === "listEvents") {
        return [
          { _id: "e1", name: "Event 1" },
          { _id: "e2", name: "Event 2" },
        ];
      }
      if (queryFn.name === "getMyEvents") {
        return [{ _id: "e1", name: "Event 1", role: "Seller" }];
      }
      return [];
    });
    mockMutation.mockClear();
  });

  it("can submit product form via mock", async () => {
    render(<UserDashboard />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText(/Ajouter un produit/i));
    fireEvent.click(screen.getByText(/Submit Mock Product/i));
    await waitFor(() => expect(mockMutation).toHaveBeenCalled());
  });
});
