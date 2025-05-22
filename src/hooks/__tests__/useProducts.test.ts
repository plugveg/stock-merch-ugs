import { renderHook, act } from "@testing-library/react";
import { useProducts } from "../useProducts";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useConvexMutation, convexQuery } from "@convex-dev/react-query";
import { Conditions, ProductTypes, Status } from "convex/schema";
import { Id } from "convex/_generated/dataModel";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
    useQueryClient: vi.fn(),
    useMutation: vi.fn(),
  };
});

vi.mock("@convex-dev/react-query", () => ({
  convexQuery: vi.fn(),
  useConvexMutation: vi.fn(),
}));

const mockUseQuery = useQuery as Mock;
const mockUseQueryClient = useQueryClient as Mock;
const mockUseMutation = useMutation as Mock;
const mockUseConvexMutation = useConvexMutation as Mock;
const mockConvexQuery = convexQuery as Mock;

const mockedProducts = [
  { id: "1", name: "Product 1" },
  { id: "2", name: "Product 2" },
];

describe("useProducts hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    mockConvexQuery.mockReturnValue({ queryKey: ["products"] });

    mockUseQuery.mockImplementation(() => ({
      data: mockedProducts,
      isLoading: false,
      error: null,
    }));

    mockUseMutation.mockReturnValue({ mutateAsync: vi.fn() });
    mockUseConvexMutation.mockReturnValue(vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("returns products and default state", () => {
    const { result } = renderHook(() => useProducts());

    expect(result.current.products).toHaveLength(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.showSkeleton).toBe(false);
    expect(typeof result.current.refetchProducts).toBe("function");
  });

  it("check if there is no showSkeleton after 100ms if loading", () => {
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

    const { result, rerender } = renderHook(() => useProducts());

    expect(result.current.showSkeleton).toBe(false);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender();

    expect(result.current.showSkeleton).toBe(false);
  });

  it("calls invalidateQueries when refetchProducts is triggered", () => {
    const invalidateMock = vi.fn();

    mockUseQueryClient.mockReturnValue({
      invalidateQueries: invalidateMock,
    });

    const { result } = renderHook(() => useProducts());

    act(() => {
      result.current.refetchProducts();
    });

    expect(invalidateMock).toHaveBeenCalledWith({
      queryKey: ["products"],
    });
  });

  it("calls addProduct mutation correctly", async () => {
    const mutateAsyncMock = vi.fn();
    mockUseMutation.mockReturnValue({ mutateAsync: mutateAsyncMock });

    const { result } = renderHook(() => useProducts());

    const validProductInput = {
      photo: "photo-url",
      sellLocation: "store",
      sellDate: Date.now(),
      sellPrice: 100,
      collectionId: "collection-id" as Id<"collections">,
      threshold: 10,
      status: "In Stock" as Status,
      productName: "Test Product",
      description: "A test product",
      quantity: 5,
      storageLocation: "Warehouse A",
      condition: "New" as Conditions,
      licenseName: ["Marvel"],
      characterName: ["Spider-Man"],
      seriesName: "Series 1",
      material: "Plastic",
      productType: ["Accessory"] as ProductTypes[],
      purchaseLocation: "Online Store",
      purchaseDate: Date.now(),
      purchasePrice: 80,
    };

    await act(async () => {
      await result.current.addProduct.mutateAsync(validProductInput);
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith(validProductInput);
  });

  it("calls updateProduct mutation correctly", async () => {
    const mutateAsyncMock = vi.fn();
    mockUseMutation.mockReturnValue({ mutateAsync: mutateAsyncMock });

    const { result } = renderHook(() => useProducts());

    await act(async () => {
      await result.current.updateProduct.mutateAsync({
        id: { __tableName: "products" } as unknown as Id<"products">,
        productName: "Updated Product",
      });
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      id: {
        __tableName: "products",
      },
      productName: "Updated Product",
    });
  });

  it("calls deleteProduct mutation correctly", async () => {
    const mutateAsyncMock = vi.fn();
    mockUseMutation.mockReturnValue({ mutateAsync: mutateAsyncMock });

    const { result } = renderHook(() => useProducts());

    // Create a mock Id<"products"> object
    const mockProductId = {
      __tableName: "products",
    } as unknown as Id<"products">;

    await act(async () => {
      await result.current.deleteProduct.mutateAsync({ id: mockProductId });
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({ id: mockProductId });
  });
});
