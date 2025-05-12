import { renderHook } from "@testing-library/react";
import { useCurrentUser } from "../useCurrentUser";
import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from "vitest";
import { useConvexAuth, useQuery } from "convex/react";

// Mock the convex/react module
vi.mock("convex/react", async () => {
  const actual = await vi.importActual("convex/react");
  return {
    ...actual,
    useConvexAuth: vi.fn(),
    useQuery: vi.fn(),
  };
});

const mockUseConvexAuth = useConvexAuth as Mock;
const mockUseQuery = useQuery as Mock;

describe("useCurrentUser hook", () => {
  beforeEach(() => {
    // By default, user is not loading nor authenticated, and query returns null
    mockUseConvexAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });
    mockUseQuery.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns loading true while auth is loading", () => {
    mockUseConvexAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    });
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userInConvex).toBeNull();
  });

  it("returns not loading and not authenticated when auth done but no user", () => {
    // auth done, not authenticated (or no user)
    mockUseConvexAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });
    mockUseQuery.mockReturnValue(null);
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userInConvex).toBeNull();
  });

  it("returns loading true when authenticated but user query still null", () => {
    mockUseConvexAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseQuery.mockReturnValue(null);
    const { result } = renderHook(() => useCurrentUser());
    // isUserQueryLoading = true => overall isLoading true
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userInConvex).toBeNull();
  });

  it("returns loaded and authenticated when user is returned", () => {
    const fakeUser = { id: "1", name: "Alice" };
    mockUseConvexAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });
    mockUseQuery.mockReturnValue(fakeUser);
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userInConvex).toBe(fakeUser);
  });
});
