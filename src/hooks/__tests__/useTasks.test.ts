import { renderHook } from "@testing-library/react";
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
import { useQuery } from "@tanstack/react-query";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
  };
});

const mockUseQuery = useQuery as Mock;

describe("useTasks hook", () => {
  beforeEach(() => {
    mockUseQuery.mockImplementation(() => ({
      data: [{ _id: "1", text: "Task 1", isCompleted: true }],
      isLoading: false,
      error: null,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns tasks and default state", () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.showSkeleton).toBe(false);
    expect(typeof result.current.refetchTasks).toBe("function");
  });
});
