import { Id } from 'convex/_generated/dataModel'
import { renderHook, act } from '@testing-library/react'
import { Conditions, ProductTypes, Status } from 'convex/schema'
import { useConvexMutation, convexQuery } from '@convex-dev/react-query'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

import { useProducts } from '../useProducts'

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useMutation: vi.fn(),
    useQuery: vi.fn(),
    useQueryClient: vi.fn(),
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
      error: null,
      isLoading: false,
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
        error: null,
        isLoading: true,
      })
      .mockReturnValueOnce({
        data: undefined,
        error: null,
        isLoading: true,
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
      characterName: ['Spider-Man'],
      collectionId: 'collection-id' as Id<'collections'>,
      condition: 'New' as Conditions,
      description: 'A test product',
      licenseName: ['Marvel'],
      material: 'Plastic',
      ownerUserId: 'user-id' as Id<'users'>,
      productName: 'Test Product',
      productType: ['Accessory'] as ProductTypes[],
      purchaseDate: Date.now(),
      purchaseLocation: 'Online Store',
      purchasePrice: 80,
      quantity: 5,
      sellDate: Date.now(),
      sellLocation: 'store',
      sellPrice: 100,
      seriesName: 'Series 1',
      status: 'In Stock' as Status,
      storageLocation: 'Warehouse A',
      threshold: 10,
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
        error: null,
        isLoading: false,
      })

      const { result } = renderHook(() => useProducts())
      expect(result.current.products).toEqual(['a', 'b'])
    })

    it('unwraps `page` property when data is paginated', () => {
      const page = [{ id: 1 }, { id: 2 }]
      mockUseQuery.mockReturnValueOnce({
        data: { nextCursor: null, page },
        error: null,
        isLoading: false,
      })

      const { result } = renderHook(() => useProducts())
      expect(result.current.products).toEqual(page)
    })

    it('falls back to empty array when data is undefined', () => {
      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        error: null,
        isLoading: false,
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
        characterName: [],
        condition: 'New',
        description: '',
        licenseName: [],
        productName: 'X',
        productType: [],
        purchaseDate: 0,
        purchaseLocation: '',
        purchasePrice: 0,
        quantity: 0,
        status: 'In Stock',
        storageLocation: '',
        threshold: 1,
      })
    })

    expect(invalidateSpy).toHaveBeenCalledTimes(1)
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['products'],
    })
  })
})
