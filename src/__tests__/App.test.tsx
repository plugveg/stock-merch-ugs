import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import App from "../App";
import { describe, it, expect, vi } from "vitest";

vi.mock("../hooks/useTasks", () => ({
  useTasks: () => ({
    tasks: [
      { _id: "1", text: "Mocked Task 1", isCompleted: true },
      { _id: "2", text: "Mocked Task 2", isCompleted: false },
    ],
    isLoading: false,
    showSkeleton: false,
    error: null,
    refetchTasks: vi.fn(),
  }),
}));

describe("App component", () => {
  it("renders title and counter", () => {
    render(<App />);
    expect(screen.getByText("StockMerchUGS")).toBeInTheDocument();
    expect(screen.getByText("Welcome to Our Platform")).toBeInTheDocument();
    expect(screen.getByText("Increment Counter")).toBeInTheDocument();
  });

  it("displays tasks from mocked hook", () => {
    render(<App />);
    expect(screen.getByText(/Mocked Task 1/)).toBeInTheDocument();
    expect(screen.getByText(/Completed/)).toBeInTheDocument();
    expect(screen.getByText(/Mocked Task 2/)).toBeInTheDocument();
    expect(screen.getByText(/Pending/)).toBeInTheDocument();
  });
});
