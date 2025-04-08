import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../App";
import { useTasks } from "../hooks/useTasks";

vi.mock("../hooks/useTasks", () => ({
  useTasks: vi.fn(),
}));

const mockUseTasks = useTasks as ReturnType<typeof vi.fn>;

describe("App component", () => {
  beforeEach(() => {
    mockUseTasks.mockReturnValue({
      tasks: [],
      isLoading: false,
      showSkeleton: false,
      error: null,
      refetchTasks: vi.fn(),
    });
  });

  it("renders counter and increments on click", () => {
    render(<App />);
    const button = screen.getByText("Increment Counter");
    const counter = screen.getByText("0");

    fireEvent.click(button);
    expect(counter.textContent).toBe("1");

    fireEvent.click(button);
    expect(counter.textContent).toBe("2");
  });

  it("renders title and description", () => {
    render(<App />);
    expect(screen.getByText("StockMerchUGS")).toBeInTheDocument();
    expect(screen.getByText("Welcome to Our Platform")).toBeInTheDocument();
  });

  it("increments counter on button click", () => {
    render(<App />);
    const button = screen.getByText("Increment Counter");
    fireEvent.click(button);
    expect(screen.getByText("1")).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("displays error message when error exists", () => {
    mockUseTasks.mockReturnValueOnce({
      tasks: [],
      isLoading: false,
      showSkeleton: false,
      error: new Error("Fetch error"),
      refetchTasks: vi.fn(),
    });
    render(<App />);
    expect(screen.getByText("Error: Fetch error")).toBeInTheDocument();
  });

  it("displays loading skeleton", () => {
    mockUseTasks.mockReturnValueOnce({
      tasks: [],
      isLoading: true,
      showSkeleton: true,
      error: null,
      refetchTasks: vi.fn(),
    });
    render(<App />);
    expect(screen.getAllByRole("listitem").length).toBe(3);
  });

  it("displays loading skeleton when showSkeleton is true", () => {
    mockUseTasks.mockReturnValue({
      tasks: [],
      isLoading: true,
      showSkeleton: true,
      error: null,
      refetchTasks: vi.fn(),
    });

    render(<App />);
    const skeletons = screen.getAllByRole("listitem");
    expect(skeletons.length).toBe(3);
  });

  it("displays error when error is present", () => {
    mockUseTasks.mockReturnValue({
      tasks: [],
      isLoading: false,
      showSkeleton: false,
      error: new Error("Failed to fetch"),
      refetchTasks: vi.fn(),
    });

    render(<App />);
    expect(screen.getByText(/Error: Failed to fetch/)).toBeInTheDocument();
  });

  it("displays tasks when loaded", () => {
    mockUseTasks.mockReturnValue({
      tasks: [
        { _id: "1", text: "Task A", isCompleted: true },
        { _id: "2", text: "Task B", isCompleted: false },
      ],
      isLoading: false,
      showSkeleton: false,
      error: null,
      refetchTasks: vi.fn(),
    });

    render(<App />);
    expect(screen.getByText("Task A - Completed")).toBeInTheDocument();
    expect(screen.getByText("Task B - Pending")).toBeInTheDocument();
  });

  it("displays tasks", () => {
    mockUseTasks.mockReturnValueOnce({
      tasks: [
        { _id: "1", text: "Test 1", isCompleted: true },
        { _id: "2", text: "Test 2", isCompleted: false },
      ],
      isLoading: false,
      showSkeleton: false,
      error: null,
      refetchTasks: vi.fn(),
    });
    render(<App />);
    expect(screen.getByText("Test 1 - Completed")).toBeInTheDocument();
    expect(screen.getByText("Test 2 - Pending")).toBeInTheDocument();
  });
});
