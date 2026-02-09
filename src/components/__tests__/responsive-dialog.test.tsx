import { describe, it, vi, beforeEach, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

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

// Mock Dialog UI Components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    children,
    onOpenChange,
    open,
  }: React.PropsWithChildren<{
    open: boolean
    onOpenChange: (_nextOpen: boolean) => void
  }>) =>
    open ? (
      <div data-testid="dialog" onClick={() => onOpenChange(false)}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogDescription: ({ children }: React.PropsWithChildren<object>) => <p>{children}</p>,
  DialogHeader: ({ children }: React.PropsWithChildren<object>) => <div>{children}</div>,
  DialogTitle: ({ children }: React.PropsWithChildren<object>) => <h2>{children}</h2>,
}))

describe('ResponsiveDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetModules()
  })

  it('should not render when not mounted (SSR mismatch guard)', async () => {
    vi.doMock('@/hooks/useMobile', () => ({
      useScreenSize: () => ({ screenSize: 'md', windowWidth: 768 }),
    }))
    vi.doMock('@/lib/getSizeClass', () => ({
      getSizeClass: () => 'sm:max-w-lg',
    }))

    const { ResponsiveDialog } = await import('../responsive-dialog')

    const { container } = render(
      <ResponsiveDialog
        open={true}
        onOpenChange={() => {
          /* empty */
        }}
        title="Test Title"
      >
        <p>Test Content</p>
      </ResponsiveDialog>
    )
    vi.runAllTimers()
    expect(container).not.toBeEmptyDOMElement()
  })

  it('should render title, description and children correctly', async () => {
    vi.doMock('@/hooks/useMobile', () => ({
      useScreenSize: () => ({ screenSize: 'md', windowWidth: 768 }),
    }))
    vi.doMock('@/lib/getSizeClass', () => ({
      getSizeClass: () => 'sm:max-w-lg',
    }))

    const { ResponsiveDialog } = await import('../responsive-dialog')

    render(
      <ResponsiveDialog
        open={true}
        onOpenChange={() => {
          /* empty */
        }}
        title="Dialog Title"
        description="This is a description"
      >
        <div>Child Content</div>
      </ResponsiveDialog>
    )

    expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    expect(screen.getByText('This is a description')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('should apply correct class based on screenSize and size', async () => {
    vi.doMock('@/hooks/useMobile', () => ({
      useScreenSize: () => ({ screenSize: 'md', windowWidth: 768 }),
    }))
    vi.doMock('@/lib/getSizeClass', () => ({
      getSizeClass: () => 'sm:max-w-lg',
    }))

    const { ResponsiveDialog } = await import('../responsive-dialog')

    render(
      <ResponsiveDialog
        open={true}
        onOpenChange={() => {
          /* empty */
        }}
        title="Dialog Title"
        size="lg"
      >
        <div>Child Content</div>
      </ResponsiveDialog>
    )

    const content = screen.getByTestId('dialog-content')
    expect(content.className).toContain('sm:max-w-lg')
  })

  it('should call onOpenChange when closing dialog', async () => {
    vi.doMock('@/hooks/useMobile', () => ({
      useScreenSize: () => ({ screenSize: 'md', windowWidth: 768 }),
    }))
    vi.doMock('@/lib/getSizeClass', () => ({
      getSizeClass: () => 'sm:max-w-lg',
    }))

    const { ResponsiveDialog } = await import('../responsive-dialog')

    const onOpenChange = vi.fn()
    render(
      <ResponsiveDialog open={true} onOpenChange={onOpenChange} title="Closable Dialog">
        <div>Content</div>
      </ResponsiveDialog>
    )

    fireEvent.click(screen.getByTestId('dialog'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('ResponsiveDialog - size class mapping', () => {
  screenSizes.forEach((screenSize) => {
    sizes.forEach((size) => {
      it(`should apply correct class for screenSize="${screenSize}" and size="${size}"`, async () => {
        vi.resetModules()

        vi.doMock('@/hooks/useMobile', () => ({
          useScreenSize: () => ({
            screenSize,
            windowWidth: 500,
          }),
        }))

        vi.doMock('@/lib/getSizeClass', () => ({
          getSizeClass: (sc: string, sz: string) =>
            expectedClasses[sc as keyof typeof expectedClasses][sz as keyof (typeof expectedClasses)['xs']],
        }))

        const { ResponsiveDialog } = await import('../responsive-dialog')

        render(
          <ResponsiveDialog
            open={true}
            onOpenChange={() => {
              /* empty */
            }}
            title="Test"
            size={size}
          >
            <p>Child</p>
          </ResponsiveDialog>
        )

        const content = screen.getByTestId('dialog-content')
        const expected = expectedClasses[screenSize][size]
        expected.split(' ').forEach((cls) => {
          expect(content.className).toContain(cls)
        })
      })
    })
  })
})
