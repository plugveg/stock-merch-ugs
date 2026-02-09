'use client'

import { useState, useEffect } from 'react'

// Define screen size breakpoints
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export function useScreenSize(): {
  screenSize: ScreenSize
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  windowWidth: number
} {
  const [screenSize, setScreenSize] = useState<ScreenSize>('lg')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth

      if (width < 480) {
        setScreenSize('xs')
      } else if (width < 640) {
        setScreenSize('sm')
      } else if (width < 768) {
        setScreenSize('md')
      } else if (width < 1024) {
        setScreenSize('lg')
      } else if (width < 1280) {
        setScreenSize('xl')
      } else {
        setScreenSize('2xl')
      }
    }

    // Set initial value
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    isDesktop: screenSize === 'xl' || screenSize === '2xl',
    isMobile: screenSize === 'xs' || screenSize === 'sm',
    isTablet: screenSize === 'md' || screenSize === 'lg',
    screenSize,
    windowWidth: window.innerWidth,
  }
}

// For backward compatibility
export const useMobile = (): boolean => {
  const { isMobile } = useScreenSize()
  return isMobile
}
