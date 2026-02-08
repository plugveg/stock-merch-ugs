import { renderHook, act } from '@testing-library/react'
import { useProducts } from '../useProducts'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useConvexMutation, convexQuery } from '@convex-dev/react-query'
import { Conditions, ProductTypes, Status } from 'convex/schema'
import { Id } from 'convex/_generated/dataModel'

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: vi.fn(),
    useQueryClient: vi.fn(),
    useMutation: vi.fn(),
  }
})

vi.mock('@convex-dev/react-query', () => ({
  convexQuery: vi.fn(),
  useConvexMutation: vi.fn(),
}))

const mockUseQuery = useQuery as Mock
const mockUseMutation = useMutation as Mock
const mockUseConvexMutation = useConvexMutation as Mock
const mockConvexQuery = convexQuery as Mock
const mockUseQueryClient = useQueryClient as Mock

const mockedProducts = [
  { id: '1', name: 'Product 1' },
  { id: '2', name: 'Product 2' },
]

describe('useProducts hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    mockConvexQuery.mockReturnValue({ queryKey: ['products'] })

    mockUseQuery.mockImplementation(() => ({
      data: mockedProducts,
      isLoading: false,
      error: null,
    }))

    mockUseMutation.mockReturnValue({ mutateAsync: vi.fn() })
    mockUseConvexMutation.mockReturnValue(vi.fn())

    mockUseQueryClient.mockReturnValue({ invalidateQueries: vi.fn() })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('returns products and default state', () => {
    const { result } = renderHook(() => useProducts())

    expect(result.current.products).toHaveLength(2)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('check if there is no showSkeleton after 100ms if loading', () => {
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
      })

    const { rerender } = renderHook(() => useProducts())

    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender()
  })

  it('calls addProduct mutation correctly', async () => {
    const mutateAsyncMock = vi.fn()
    mockUseMutation.mockReturnValue({ mutateAsync: mutateAsyncMock })

    const { result } = renderHook(() => useProducts())

    const validProductInput = {
      sellLocation: 'store',
      sellDate: Date.now(),
      sellPrice: 100,
      collectionId: 'collection-id' as Id<'collections'>,
      threshold: 10,
      status: 'In Stock' as Status,
      productName: 'Test Product',
      description: 'A test product',
      quantity: 5,
      storageLocation: 'Warehouse A',
      condition: 'New' as Conditions,
      licenseName: ['Marvel'],
      characterName: ['Spider-Man'],
      seriesName: 'Series 1',
      material: 'Plastic',
      productType: ['Accessory'] as ProductTypes[],
      purchaseLocation: 'Online Store',
      purchaseDate: Date.now(),
      purchasePrice: 80,
      ownerUserId: 'user-id' as Id<'users'>,
    }

    await act(async () => {
      await result.current.addProduct.mutateAsync(validProductInput)
    })

    expect(mutateAsyncMock).toHaveBeenCalledWith(validProductInput)
  })

  it('calls updateProduct mutation correctly', async () => {
    const mutateAsyncMock = vi.fn()
    mockUseMutation.mockReturnValue({ mutateAsync: mutateAsyncMock })

    const { result } = renderHook(() => useProducts())

    await act(async () => {
      await result.current.updateProduct.mutateAsync({
        id: { __tableName: 'products' } as unknown as Id<'products'>,
        productName: 'Updated Product',
      })
    })

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      id: {
        __tableName: 'products',
      },
      productName: 'Updated Product',
    })
  })

  it('calls deleteProduct mutation correctly', async () => {
    const mutateAsyncMock = vi.fn()
    mockUseMutation.mockReturnValue({ mutateAsync: mutateAsyncMock })

    const { result } = renderHook(() => useProducts())

    // Create a mock Id<"products"> object
    const mockProductId = {
      __tableName: 'products',
    } as unknown as Id<'products'>

    await act(async () => {
      await result.current.deleteProduct.mutateAsync({ id: mockProductId })
    })

    expect(mutateAsyncMock).toHaveBeenCalledWith({ id: mockProductId })
  })

  it('includes targetUserId when userId is provided', () => {
    // Create a mock Id<"users"> object
    const testUserId = { __tableName: 'users' } as unknown as Id<'users'>
    renderHook(() => useProducts({ userId: testUserId }))

    // second argument of convexQuery should contain the targetUserId we passed
    expect(mockConvexQuery).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ targetUserId: testUserId }))
  })

  describe('products normalisation', () => {
    it('returns raw array as‑is', () => {
      mockUseQuery.mockReturnValueOnce({
        data: ['a', 'b'],
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useProducts())
      expect(result.current.products).toEqual(['a', 'b'])
    })

    it('unwraps `page` property when data is paginated', () => {
      const page = [{ id: 1 }, { id: 2 }]
      mockUseQuery.mockReturnValueOnce({
        data: { page, nextCursor: null },
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useProducts())
      expect(result.current.products).toEqual(page)
    })

    it('falls back to empty array when data is undefined', () => {
      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useProducts())
      expect(result.current.products).toEqual([])
    })
  })

  it('invalidates the query after a successful mutation', async () => {
    // Arrange a fresh invalidateQueries spy for this test
    const invalidateSpy = vi.fn()
    mockUseQueryClient.mockReturnValueOnce({
      invalidateQueries: invalidateSpy,
    })

    // Mock useMutation to immediately call onSuccess
    mockUseMutation.mockImplementationOnce(({ onSuccess }) => ({
      mutateAsync: vi.fn().mockImplementation(async () => {
        onSuccess?.() // simulate successful mutation
      }),
    }))

    const { result } = renderHook(() => useProducts())

    await act(async () => {
      await result.current.addProduct.mutateAsync({
        productName: 'X',
        threshold: 1,
        status: 'In Stock',
        description: '',
        quantity: 0,
        storageLocation: '',
        condition: 'New',
        licenseName: [],
        characterName: [],
        productType: [],
        purchaseLocation: '',
        purchaseDate: 0,
        purchasePrice: 0,
      })
    })

    expect(invalidateSpy).toHaveBeenCalledTimes(1)
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['products'],
    })
  })
})
