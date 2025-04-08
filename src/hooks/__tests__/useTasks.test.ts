import { renderHook, act } from "@testing-library/react";
import { useTasks } from "../useTasks";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { useQuery, useQueryClient } from "@tanstack/react-query";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
    useQueryClient: vi.fn(),
  };
});

const mockUseQuery = useQuery as Mock;
const mockUseQueryClient = useQueryClient as Mock;

describe("useTasks hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    mockUseQuery.mockImplementation(() => ({
      data: [{ _id: "1", text: "Task 1", isCompleted: true }],
      isLoading: false,
      error: null,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("returns tasks and default state", () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.showSkeleton).toBe(false);
    expect(typeof result.current.refetchTasks).toBe("function");
  });

  it("sets showSkeleton to true after 100ms if loading", () => {
    mockUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
      })
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
      });

    const { result, rerender } = renderHook(() => useTasks());

    expect(result.current.showSkeleton).toBe(false);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender();

    expect(result.current.showSkeleton).toBe(false);
  });

  it("calls invalidateQueries when refetchTasks is triggered", () => {
    const invalidateMock = vi.fn();

    mockUseQueryClient.mockReturnValue({
      invalidateQueries: invalidateMock,
    });

    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.refetchTasks();
    });

    expect(invalidateMock).toHaveBeenCalledWith({
      queryKey: expect.any(Array),
    });
  });
});
