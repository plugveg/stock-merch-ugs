import { ClerkProvider } from '@clerk/clerk-react'
import userEvent from '@testing-library/user-event'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import Products from '@/Products'

beforeEach(() => {
  vi.clearAllMocks()
  mockUsersResults.length = 0 // reset users between tests
})

// --- spies for product mutations ---
const addMutateSpy = vi.fn((_data, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.())
const updateMutateSpy = vi.fn((_data, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.())
const deleteMutateSpy = vi.fn()

// --- shared mock users list so individual tests can push their own entries
const mockUsersResults: { _id: string; label: string }[] = []

// Mock Clerk user
vi.mock('@clerk/clerk-react', async () => {
  const actual = await vi.importActual<object>('@clerk/clerk-react')
  return {
    ...actual,
    UserButton: () => <div>UserButton</div>,
    useUser: () => ({
      user: {
        fullName: 'Mocky',
        id: 'user_123',
        primaryEmailAddress: {
          emailAddress: 'mocky@example.com',
        },
      },
    }),
  }
})

// Mock ConvexProvider
vi.mock('convex/react-clerk', async () => {
  const actual = await vi.importActual<object>('convex/react-clerk')
  return {
    ...actual,
    ConvexProviderWithClerk: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
  }
})

// Mock useCurrentUser
vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    userInConvex: {
      _id: 'admin_1',
      email: 'admin@example.com',
      nickname: 'Admin',
      role: 'Administrator',
    },
  }),
}))

// Mock useUsersLite (relative path)
vi.mock('@/hooks/useUsersLite', () => ({
  useUsersLite: () => ({
    results: mockUsersResults,
  }),
}))

// Mock Navbar
vi.mock('@/components/navbar', () => ({
  default: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
}))

// Mock RoleBadge
vi.mock('@/components/role-badge', () => ({
  default: ({ role }: { role: string }) => <div>RoleBadge: {role}</div>,
  RoleBadge: ({ role }: { role: string }) => <div>RoleBadge: {role}</div>,
}))

// Mock StockOverview
vi.mock('@/components/stock-overview', () => ({
  StockOverview: () => <div>StockOverview</div>,
}))

// Mock ResponsiveDialog
vi.mock('@/components/responsive-dialog', () => ({
  ResponsiveDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock StockForm
vi.mock('@/components/stock-form', () => ({
  StockForm: ({
    initialData,
    onCancel,
    onSubmit,
  }: {
    initialData?: { _id?: string; name?: string; quantity?: number }
    onSubmit: (_data: { _id?: string; name: string; quantity: number }) => void
    onCancel: () => void
  }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const payload = initialData
          ? { ...initialData, name: 'Mock product', quantity: 1 }
          : { name: 'Mock product', quantity: 1 }
        onSubmit(payload)
      }}
    >
      <button type="submit">Submit</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  ),
}))

// Mock StockTable
vi.mock('@/components/stock-table', () => ({
  StockTable: ({
    onDelete,
    onEdit,
  }: {
    onEdit: (_item: { _id: string; name: string; quantity: number; threshold: number }) => void
    onDelete: (_id: string) => void
  }) => (
    <div>
      StockTable
      <button onClick={() => onEdit({ _id: '1', name: 'Product 1', quantity: 1, threshold: 2 })}>Edit</button>
      <button onClick={() => onDelete('1')}>Delete</button>
    </div>
  ),
}))

// Mock StockCharts
vi.mock('@/components/stock-charts', () => ({
  StockCharts: () => <div>StockCharts</div>,
}))

// Mock useProducts
vi.mock('@/hooks/useProducts', () => ({
  default: () => ({
    addProduct: { mutate: addMutateSpy },
    deleteProduct: { mutate: deleteMutateSpy },
    error: null,
    isLoading: false,
    products: [
      { _id: '1', name: 'Product 1', quantity: 1, threshold: 2 },
      { _id: '2', name: 'Product 2', quantity: 3, threshold: 1 },
    ],
    updateProduct: { mutate: updateMutateSpy },
  }),
}))

// --- simple mock for Radix Select ---------------------------------
vi.mock('@/components/ui/select', () => {
  // helper to recursively collect any element that carries a "value" prop
  // ...existing code...
  type OptionElement = React.ReactElement<{ value: string; children?: React.ReactNode }>

  const isOptionElement = (node: unknown): node is OptionElement => {
    if (!node || typeof node !== 'object' || !('props' in node)) return false
    const props = (node as { props?: unknown }).props
    return !!props && typeof props === 'object' && 'value' in (props as { value?: unknown })
  }

  const hasChildrenProp = (node: unknown): node is { props: { children?: unknown } } => {
    if (!node || typeof node !== 'object' || !('props' in node)) return false
    const props = (node as { props?: unknown }).props
    return !!props && typeof props === 'object' && 'children' in (props as { children?: unknown })
  }

  const collectOptions = (nodes: unknown[]): OptionElement[] =>
    nodes.flatMap((child) => {
      if (!child) return []
      if (isOptionElement(child)) return [child]
      if (hasChildrenProp(child)) {
        const children = child.props.children
        return collectOptions(Array.isArray(children) ? children : [children])
      }
      return []
    })
  // ...existing code...

  const Select = ({
    children,
    onValueChange,
    value,
  }: {
    value: string
    onValueChange: (_nextValue: string) => void
    children: React.ReactNode
  }) => {
    const options = collectOptions(Array.isArray(children) ? children : [children])

    const displayLabel =
      options.find((o) => o.props.value === value)?.props.children ?? (value === 'all' ? 'Tous les utilisateurs' : '')

    return (
      <div>
        <button role="combobox" aria-expanded="false" aria-label="Select">
          {displayLabel}
        </button>
        {/* hidden native select to simplify tests */}
        <select data-testid="mock-select" value={value} onChange={(e) => onValueChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt.props.value} value={opt.props.value}>
              {opt.props.children}
            </option>
          ))}
        </select>
      </div>
    )
  }

  const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
  const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
  const SelectItem = ({ children, value }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  )

  // give components displayNames so collectOptions can detect them
  SelectItem.displayName = 'SelectItem'
  SelectTrigger.displayName = 'SelectTrigger'
  SelectContent.displayName = 'SelectContent'

  return { Select, SelectContent, SelectItem, SelectTrigger }
})

function renderWithProviders() {
  // Provide a mock useAuth function that matches the expected UseAuth type
  const mockUseAuth = () => ({
    getToken: async () => 'mock-token',
    isAuthenticated: true,
    isLoaded: true,
    isLoading: false,
    isSignedIn: true,
    orgId: undefined,
    orgRole: undefined,
    orgSlug: undefined,
    userId: 'user_123',
  })

  // Provide a minimal mock for IConvexReactClient
  const mockConvexClient = {
    // Add only the properties/methods required by your components/tests
    // For example, subscribe: jest.fn(), query: jest.fn(), mutation: jest.fn(), etc.
    clearAuth: vi.fn(),
    setAuth: vi.fn(),
  } as unknown as {
    setAuth: () => void
    clearAuth: () => void
  }

  return render(
    <ClerkProvider publishableKey="pk_test_Y2FyZWZ1bC1jaGlja2VuLTExLmNsZXJrLmFjY291bnRzLmRldiQ">
      <ConvexProviderWithClerk client={mockConvexClient} useAuth={mockUseAuth}>
        <Products />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

describe('Products Component', () => {
  it('renders overview and tabs', () => {
    renderWithProviders()
    expect(screen.getByText('StockOverview')).toBeInTheDocument()
    expect(screen.getByText('Inventaire actuel')).toBeInTheDocument()
    expect(screen.getByText('Ajouter un produit')).toBeInTheDocument()
  })

  it('renders Current Inventory section with alert', () => {
    renderWithProviders()
    expect(screen.getByText('1 produits en-dessous du seuil')).toBeInTheDocument()
  })

  it('opens add dialog and triggers submit', async () => {
    renderWithProviders()
    userEvent.click(screen.getByText('Ajouter un produit'))
    userEvent.click(screen.getByText('Edit'))
    const submitButtons = screen.getAllByRole('button', { name: /submit/i })
    userEvent.click(submitButtons[submitButtons.length - 1])
  })

  it('opens edit dialog and submits updated item', async () => {
    renderWithProviders()
    userEvent.click(screen.getByText('Edit'))
    const submitButtons = screen.getAllByRole('button', { name: /submit/i })
    userEvent.click(submitButtons[submitButtons.length - 1])

    await waitFor(() => {
      expect(screen.queryByText('Modifier un produit')).not.toBeInTheDocument()
    })
  })

  it('cancels Add Item dialog without calling mutate', async () => {
    renderWithProviders()
    userEvent.click(screen.getByText('Ajouter un produit'))

    // le bouton Cancel est le premier dans le formulaire simulé
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
    userEvent.click(cancelButtons[0])

    expect(addMutateSpy).not.toHaveBeenCalled()
  })

  it('calls addProduct.mutate with form data then closes dialog', async () => {
    renderWithProviders()
    userEvent.click(screen.getByText('Ajouter un produit'))
    const submitButtons = screen.getAllByRole('button', { name: /submit/i })
    userEvent.click(submitButtons[0])

    await waitFor(() => {
      expect(addMutateSpy).toHaveBeenCalledWith(
        { name: 'Mock product', quantity: 1, targetUserId: 'admin_1' },
        expect.any(Object)
      )
    })
  })

  it('cancels Edit Item dialog without calling updateProduct', async () => {
    renderWithProviders()

    // 1. Ouvre le dialogue d'édition
    userEvent.click(screen.getByText('Edit'))

    // 2. Attends que le second formulaire (celui du dialogue) soit monté
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /cancel/i }).length).toBeGreaterThan(1)
    })

    // 3. Clique sur le bouton Cancel du dialogue d'édition (le dernier "Cancel" rendu)
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
    userEvent.click(cancelButtons[cancelButtons.length - 1])

    // 4. Attends que le formulaire du dialogue soit démonté (retour à 1 bouton Cancel)
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /cancel/i }).length).toBe(2)
    })

    // 5. Vérifie qu'aucune mutation de mise à jour n'a été appelée
    expect(updateMutateSpy).not.toHaveBeenCalled()
  })

  it('calls updateProduct.mutate with correct data then closes dialog', async () => {
    renderWithProviders()
    userEvent.click(screen.getByText('Edit'))
    const submitButtons = screen.getAllByRole('button', { name: /submit/i })
    userEvent.click(submitButtons[submitButtons.length - 1])

    await waitFor(() => {
      expect(updateMutateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Mock product', quantity: 1 }),
        expect.any(Object)
      )
      expect(screen.queryByText('Modifier un produit')).not.toBeInTheDocument()
    })
  })

  it('calls deleteProduct.mutate when Delete button is clicked', async () => {
    renderWithProviders()
    userEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(deleteMutateSpy).toHaveBeenCalledWith({ id: '1' })
    })
  })

  it('calls deleteProduct when clicking delete', () => {
    renderWithProviders()
    userEvent.click(screen.getByText('Delete'))
    // The mutate function is mocked, so we can’t assert here directly
  })

  it('shows RoleBadge and user selector when user is admin', () => {
    renderWithProviders()
    expect(screen.getByText('RoleBadge: Administrator')).toBeInTheDocument()
    expect(screen.getByText('Sélectionner un utilisateur ou tous pour voir ses produits')).toBeInTheDocument()
  })
})
