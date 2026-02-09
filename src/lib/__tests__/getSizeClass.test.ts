import { describe, it, expect } from 'vitest'

import { getSizeClass } from '../getSizeClass'

const screenSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const

const expectedClasses: Record<string, Record<string, string>> = {
  lg: {
    full: 'sm:max-w-2xl',
    lg: 'sm:max-w-3xl',
    md: 'sm:max-w-md',
    sm: 'sm:max-w-sm',
    xl: 'sm:max-w-xl',
  },
  md: {
    full: 'sm:max-w-lg',
    lg: 'sm:max-w-lg',
    md: 'sm:max-w-md',
    sm: 'sm:max-w-sm',
    xl: 'sm:max-w-xl',
  },
  sm: {
    full: 'w-[calc(100%-2rem)] sm:max-w-full',
    lg: 'w-[calc(100%-2rem)] sm:max-w-full',
    md: 'w-[calc(100%-2rem)] sm:max-w-full',
    sm: 'w-[calc(100%-2rem)] sm:max-w-sm',
    xl: 'w-[calc(100%-2rem)] sm:max-w-full',
  },
  xl: {
    full: 'sm:max-w-3xl',
    lg: 'sm:max-w-3xl',
    md: 'sm:max-w-md',
    sm: 'sm:max-w-sm',
    xl: 'sm:max-w-xl',
  },
  xs: {
    full: 'w-[calc(100%-2rem)] sm:max-w-full',
    lg: 'w-[calc(100%-2rem)] sm:max-w-full',
    md: 'w-[calc(100%-2rem)] sm:max-w-full',
    sm: 'w-[calc(100%-2rem)] sm:max-w-full',
    xl: 'w-[calc(100%-2rem)] sm:max-w-full',
  },
}

describe('getSizeClass', () => {
  screenSizes.forEach((screenSize) => {
    sizes.forEach((size) => {
      it(`returns correct class for screenSize="${screenSize}" and size="${size}"`, () => {
        expect(getSizeClass(screenSize, size)).toBe(expectedClasses[screenSize][size])
      })
    })
  })

  it('returns default for unknown screenSize and known size', () => {
    expect(getSizeClass('unknown', 'md')).toBe('sm:max-w-md')
  })

  it('returns default for known screenSize and unknown size', () => {
    expect(getSizeClass('md', 'giant')).toBe('sm:max-w-md')
  })

  it('returns default for known screenSize and unknown size', () => {
    expect(getSizeClass('lg', 'giant')).toBe('sm:max-w-md')
  })

  it('returns default for unknown screenSize and unknown size', () => {
    expect(getSizeClass('weird', 'huge')).toBe('sm:max-w-md')
  })
})
