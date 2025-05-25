import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RoleBadge } from "@/components/role-badge";

describe("RoleBadge component", () => {
  it("renders the provided role text", () => {
    render(<RoleBadge role="Administrator" />);
    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });

  it("renders as a small outline button with pointer‑events disabled", () => {
    render(<RoleBadge role="Moderator" />);
    const button = screen.getByRole("button", { name: "Moderator" });

    // Tailwind classes we expect from the component props
    expect(button).toHaveClass("pointer-events-none");
    expect(button).toHaveClass("opacity-80");
  });
});
