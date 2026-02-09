import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { useScreenSize, useMobile } from '../useMobile'

describe('useScreenSize', () => {
  const resizeWindow = (width: number) => {
    ;(window.innerWidth as number) = width
    window.dispatchEvent(new Event('resize'))
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const scenarios = [
    {
      expected: 'xs',
      isDesktop: false,
      isMobile: true,
      isTablet: false,
      width: 320,
    },
    {
      expected: 'sm',
      isDesktop: false,
      isMobile: true,
      isTablet: false,
      width: 500,
    },
    {
      expected: 'md',
      isDesktop: false,
      isMobile: false,
      isTablet: true,
      width: 700,
    },
    {
      expected: 'lg',
      isDesktop: false,
      isMobile: false,
      isTablet: true,
      width: 900,
    },
    {
      expected: 'xl',
      isDesktop: true,
      isMobile: false,
      isTablet: false,
      width: 1100,
    },
    {
      expected: '2xl',
      isDesktop: true,
      isMobile: false,
      isTablet: false,
      width: 1400,
    },
  ]

  scenarios.forEach(({ expected, isDesktop, isMobile, isTablet, width }) => {
    it(`returns correct screen size '${expected}' for width ${width}`, () => {
      const { result } = renderHook(() => useScreenSize())

      act(() => {
        resizeWindow(width)
      })

      expect(result.current.screenSize).toBe(expected)
      expect(result.current.windowWidth).toBe(width)
      expect(result.current.isMobile).toBe(isMobile)
      expect(result.current.isTablet).toBe(isTablet)
      expect(result.current.isDesktop).toBe(isDesktop)
    })
  })
})

describe('useMobile', () => {
  const resizeWindow = (width: number) => {
    ;(window.innerWidth as number) = width
    window.dispatchEvent(new Event('resize'))
  }

  beforeEach(() => {
    vi.stubGlobal('innerWidth', 1024)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when screen is mobile (xs)', () => {
    const { result } = renderHook(() => useMobile())
    act(() => {
      resizeWindow(300)
    })
    expect(result.current).toBe(true)
  })

  it('returns true when screen is mobile (sm)', () => {
    const { result } = renderHook(() => useMobile())
    act(() => {
      resizeWindow(500)
    })
    expect(result.current).toBe(true)
  })

  it('returns false when screen is tablet or desktop', () => {
    const { result } = renderHook(() => useMobile())
    act(() => {
      resizeWindow(900)
    })
    expect(result.current).toBe(false)
  })
})
