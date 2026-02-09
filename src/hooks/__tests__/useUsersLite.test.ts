import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, Mock, vi } from 'vitest'

// Mock convex/react so that we control what the hook underneath returns
vi.mock('convex/react', () => {
  return {
    usePaginatedQuery: vi.fn(),
  }
})

// We need to import AFTER the mock so that the hook picks up the mocked version
import { usePaginatedQuery } from 'convex/react'

import { useUsersLite } from '../useUsersLite'

const mockedUsePaginatedQuery = usePaginatedQuery as unknown as Mock

describe('useUsersLite', () => {
  afterEach(() => {
    mockedUsePaginatedQuery.mockReset()
  })

  it('passes the initialNumItems argument through to usePaginatedQuery', () => {
    const paginatedValue = {
      loadMore: vi.fn(),
      results: [{ _id: '1', label: 'Mock user' }],
      status: 'Loaded',
    }

    mockedUsePaginatedQuery.mockReturnValue(paginatedValue)

    const { result } = renderHook(() => useUsersLite(5))

    // It should be called once
    expect(mockedUsePaginatedQuery).toHaveBeenCalledTimes(1)
    const callArgs = mockedUsePaginatedQuery.mock.calls[0]
    expect(typeof callArgs[0]).toBe('object')
    // 2ⁿᵈ arg is the query params object
    expect(callArgs[1]).toEqual({})
    // 3ʳᵈ arg should contain the initialNumItems we passed
    expect(callArgs[2]).toEqual({ initialNumItems: 5 })

    // And the hook should return whatever usePaginatedQuery returned
    expect(result.current).toBe(paginatedValue)
  })

  it('defaults initialNumItems to 10 when no argument is provided', () => {
    const paginatedValue = {
      loadMore: vi.fn(),
      results: [],
      status: 'Loaded',
    }

    mockedUsePaginatedQuery.mockReturnValue(paginatedValue)

    renderHook(() => useUsersLite())

    expect(mockedUsePaginatedQuery).toHaveBeenCalledTimes(1)
    const callArgs = mockedUsePaginatedQuery.mock.calls[0]
    expect(callArgs[2]).toEqual({ initialNumItems: 10 })
  })
})
