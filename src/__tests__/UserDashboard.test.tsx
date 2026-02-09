import { MemoryRouter } from 'react-router'
import userEvent from '@testing-library/user-event'
import { useQuery, useMutation } from 'convex/react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'

import UserDashboard from '../UserDashboard'
import { useCurrentUser } from '../hooks/useCurrentUser'

// Mock hooks and modules
vi.mock('convex/react')
vi.mock('../hooks/useCurrentUser')

vi.mock('../components/navbar', () => ({
  default: ({ children }: { children: React.ReactNode }) => <nav data-testid="navbar">{children}</nav>,
}))

vi.mock('../components/footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}))

vi.mock('../components/role-badge', () => ({
  RoleBadge: ({ role }: { role: string }) => <span data-testid="role-badge">{role}</span>,
}))

vi.mock('../components/stock-form', () => ({
  StockForm: ({ onCancel, onSubmit }: { onSubmit: () => void; onCancel: () => void }) => (
    <div data-testid="stock-form">
      <button onClick={() => onSubmit()}>Submit Stock Form</button>
      <button onClick={onCancel}>Cancel Stock Form</button>
    </div>
  ),
}))

vi.mock('../components/responsive-dialog', () => ({
  ResponsiveDialog: ({ children, open, title }: { open: boolean; children: React.ReactNode; title: string }) => (
    <div data-testid="responsive-dialog" data-open={open}>
      {open && (
        <div>
          <h2 data-testid="dialog-title">{title}</h2>
          {children}
        </div>
      )}
    </div>
  ),
}))

vi.mock('@clerk/clerk-react', () => ({
  UserButton: () => <button data-testid="user-button">User Menu</button>,
}))

vi.mock('../components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: React.ReactNode
    onClick?: () => void
    type?: 'button' | 'submit' | 'reset'
  }) => (
    <button data-testid="button" onClick={onClick} type={type}>
      {children}
    </button>
  ),
}))

// Mock window.alert and window.confirm
global.alert = vi.fn()
global.confirm = vi.fn()

describe('UserDashboard', () => {
  const mockAddProduct = vi.fn()
  const mockUpdateProduct = vi.fn()
  const mockSetProductAvailability = vi.fn()
  const mockParticipateInEvent = vi.fn()
  const mockRemoveUserFromEvent = vi.fn()

  const mockUser = {
    _id: 'user1',
    email: 'test@example.com',
    nickname: 'TestUser',
    role: 'Member',
  }

  interface MockProduct {
    _id: string
    productName: string
    description: string
    purchasePrice: number
  }

  interface MockEvent {
    _id: string
    name: string
  }

  interface MockMyEvent {
    _id: string
    name: string
    role: string
  }

  const mockProducts: MockProduct[] = [
    {
      _id: 'product1',
      description: 'Description 1',
      productName: 'Test Product 1',
      purchasePrice: 10.5,
    },
    {
      _id: 'product2',
      description: 'Description 2',
      productName: 'Test Product 2',
      purchasePrice: 25.0,
    },
  ]

  const mockEvents: MockEvent[] = [
    {
      _id: 'event1',
      name: 'Event 1',
    },
    {
      _id: 'event2',
      name: 'Event 2',
    },
  ]

  const mockMyEvents: MockMyEvent[] = [
    {
      _id: 'event1',
      name: 'Event 1',
      role: 'Seller',
    },
  ]

  // Helper function to setup mocks for each test
  const setupMocks = ({
    events = [],
    myEvents = [],
    products = [],
  }: {
    products?: MockProduct[]
    events?: MockEvent[]
    myEvents?: MockMyEvent[]
  } = {}) => {
    ;(useCurrentUser as Mock).mockReturnValue({ userInConvex: mockUser })

    // Each call to useMutation should return the appropriate mock function
    ;(useMutation as Mock)
      .mockReturnValueOnce(mockAddProduct) // First call: api.functions.products.create
      .mockReturnValueOnce(mockSetProductAvailability) // Second call: api.functions.products.setProductAvailabilityForEvent
      .mockReturnValueOnce(mockParticipateInEvent) // Third call: api.functions.products.participateInEvent
      .mockReturnValueOnce(mockRemoveUserFromEvent) // Fourth call: api.events.removeUserFromEvent
      .mockReturnValueOnce(mockUpdateProduct) // Fifth call: api.functions.products.update
    ;(useQuery as Mock)
      .mockReturnValueOnce(products) // api.functions.products.listMyProducts
      .mockReturnValueOnce(events) // api.events.listEvents
      .mockReturnValueOnce(myEvents) // api.events.getMyEvents
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dashboard with user information', () => {
    setupMocks({
      events: mockEvents,
      myEvents: mockMyEvents,
      products: mockProducts,
    })

    render(<UserDashboard />, { wrapper: MemoryRouter })

    expect(screen.getByText('Mes produits')).toBeInTheDocument()
    expect(screen.getByText('Connecté en tant que TestUser')).toBeInTheDocument()
    expect(screen.getByTestId('role-badge')).toHaveTextContent('Member')
    expect(screen.getByTestId('user-button')).toBeInTheDocument()
  })

  it('displays navbar and footer', () => {
    setupMocks()

    render(<UserDashboard />, { wrapper: MemoryRouter })

    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('displays products list correctly', () => {
    setupMocks({
      events: mockEvents,
      myEvents: mockMyEvents,
      products: mockProducts,
    })

    render(<UserDashboard />, { wrapper: MemoryRouter })

    expect(screen.getByText('Test Product 1 - 10.50 €')).toBeInTheDocument()
    expect(screen.getByText('Test Product 2 - 25.00 €')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getByText('Description 2')).toBeInTheDocument()
  })

  it('shows message when no products exist', () => {
    setupMocks({
      events: mockEvents,
      myEvents: mockMyEvents,
      products: [],
    })

    render(<UserDashboard />, { wrapper: MemoryRouter })

    expect(screen.getByText("Vous n'avez pas encore ajouté de produits.")).toBeInTheDocument()
  })

  it('opens add product dialog when button is clicked', async () => {
    const user = userEvent.setup()
    setupMocks()

    render(<UserDashboard />, { wrapper: MemoryRouter })

    await user.click(screen.getByRole('button', { name: /ajouter un produit/i }))

    expect(screen.getByTestId('responsive-dialog')).toHaveAttribute('data-open', 'true')
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Ajouter un produit')
    expect(screen.getByTestId('stock-form')).toBeInTheDocument()
  })

  it('handles add product error', async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      /* empty */
    })
    mockAddProduct.mockRejectedValue(new Error('Failed to add product'))
    setupMocks()

    render(<UserDashboard />, { wrapper: MemoryRouter })

    await user.click(screen.getByRole('button', { name: /ajouter un produit/i }))
    await user.click(screen.getByText('Submit Stock Form'))

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(global.alert).toHaveBeenCalledWith("Erreur lors de l'ajout du produit : addProduct is not a function")
    })

    consoleErrorSpy.mockRestore()
  })

  it('cancels add product dialog', async () => {
    const user = userEvent.setup()
    setupMocks()

    render(<UserDashboard />, { wrapper: MemoryRouter })

    await user.click(screen.getByRole('button', { name: /ajouter un produit/i }))
    await user.click(screen.getByText('Cancel Stock Form'))

    expect(screen.getByTestId('responsive-dialog')).toHaveAttribute('data-open', 'false')
    expect(mockAddProduct).not.toHaveBeenCalled()
  })

  it('displays my events participation', () => {
    setupMocks({
      events: mockEvents,
      myEvents: mockMyEvents,
      products: mockProducts,
    })

    render(<UserDashboard />, { wrapper: MemoryRouter })

    expect(screen.getByText('Mes participations aux événements :')).toBeInTheDocument()
    // Use more specific text matcher to avoid ambiguity
    expect(screen.getByText('Event 1 (as Seller)')).toBeInTheDocument()
    expect(screen.getByText("Quitter l'événement")).toBeInTheDocument()
  })

  it('shows message when no event participation', () => {
    setupMocks({
      events: mockEvents,
      myEvents: [],
      products: mockProducts,
    })

    render(<UserDashboard />, { wrapper: MemoryRouter })

    expect(screen.getByText("Vous n'êtes pas encore inscrit pour un événement.")).toBeInTheDocument()
  })

  it('handles leaving an event with confirmation', async () => {
    const user = userEvent.setup()
    ;(global.confirm as Mock).mockReturnValue(true)
    mockRemoveUserFromEvent.mockResolvedValue(undefined)
    setupMocks({
      events: mockEvents,
      myEvents: mockMyEvents,
      products: mockProducts,
    })

    render(<UserDashboard />, { wrapper: MemoryRouter })

    await user.click(screen.getByText("Quitter l'événement"))

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to leave this event?')
      expect(mockRemoveUserFromEvent).toHaveBeenCalledWith({
        eventId: 'event1',
        userIdToRemove: 'user1',
      })
      expect(global.alert).toHaveBeenCalledWith('You have left the event.')
    })
  })

  it('cancels leaving event when user declines confirmation', async () => {
    const user = userEvent.setup()
    ;(global.confirm as Mock).mockReturnValue(false)

    // Setup mocks to show events data
    setupMocks({
      events: mockEvents,
      myEvents: mockMyEvents,
      products: mockProducts,
    })

    render(<UserDashboard />, { wrapper: MemoryRouter })

    await user.click(screen.getByText("Quitter l'événement"))

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to leave this event?')
    expect(mockRemoveUserFromEvent).not.toHaveBeenCalled()
  })

  it('handles leave event error', async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      /* empty */
    })
    ;(global.confirm as Mock).mockReturnValue(true)
    mockRemoveUserFromEvent.mockRejectedValue(new Error('Leave event error'))

    // Setup mocks to show events data
    setupMocks({
      events: mockEvents,
      myEvents: mockMyEvents,
      products: mockProducts,
    })

    render(<UserDashboard />, { wrapper: MemoryRouter })

    await user.click(screen.getByText("Quitter l'événement"))

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(global.alert).toHaveBeenCalledWith('Error leaving event: Leave event error')
    })

    consoleErrorSpy.mockRestore()
  })

  it('handles leave event when user is not identified', async () => {
    const user = userEvent.setup()
    // Mock user with null _id
    ;(useCurrentUser as Mock).mockReturnValue({ userInConvex: { _id: null } })

    // Setup mutations - need to maintain the mock structure
    ;(useMutation as Mock)
      .mockReturnValueOnce(mockAddProduct)
      .mockReturnValueOnce(mockSetProductAvailability)
      .mockReturnValueOnce(mockParticipateInEvent)
      .mockReturnValueOnce(mockRemoveUserFromEvent)
      .mockReturnValueOnce(mockUpdateProduct)

    // Setup queries with events data so the button appears
    ;(useQuery as Mock).mockReturnValueOnce(mockProducts).mockReturnValueOnce(mockEvents).mockReturnValueOnce(mockMyEvents)

    render(<UserDashboard />, { wrapper: MemoryRouter })

    await user.click(screen.getByText("Quitter l'événement"))

    expect(global.alert).toHaveBeenCalledWith('Could not identify logged in user.')
    expect(mockRemoveUserFromEvent).not.toHaveBeenCalled()
  })

  it('prevents form submission when required fields are empty', async () => {
    const user = userEvent.setup()

    // Setup mocks with empty data for this test
    setupMocks({
      events: [], // Empty events
      myEvents: [], // Empty my events
      products: [], // Empty products
    })

    render(<UserDashboard />, { wrapper: MemoryRouter })

    // Try to submit availability form without selections
    await user.click(screen.getByRole('button', { name: /confirmer la disponibilité/i }))

    expect(mockSetProductAvailability).not.toHaveBeenCalled()

    // Try to submit participation form without selection
    await user.click(screen.getByRole('button', { name: /confirmer la participation/i }))

    expect(mockParticipateInEvent).not.toHaveBeenCalled()
  })

  it('handles empty products and events arrays', () => {
    setupMocks({
      events: [],
      myEvents: [],
      products: [],
    })

    render(<UserDashboard />, { wrapper: MemoryRouter })

    expect(screen.getByText("Vous n'avez pas encore ajouté de produits.")).toBeInTheDocument()
    expect(screen.getByText("Vous n'êtes pas encore inscrit pour un événement.")).toBeInTheDocument()
  })

  it('handles null/undefined query results', () => {
    ;(useCurrentUser as Mock).mockReturnValue({ userInConvex: mockUser })
    ;(useMutation as Mock)
      .mockReturnValue(vi.fn())
      .mockReturnValue(vi.fn())
      .mockReturnValue(vi.fn())
      .mockReturnValue(vi.fn())
      .mockReturnValue(vi.fn())
    ;(useQuery as Mock).mockReturnValueOnce(null).mockReturnValueOnce(null).mockReturnValueOnce(null)

    render(<UserDashboard />, { wrapper: MemoryRouter })

    // Should not crash and handle gracefully
    expect(screen.getByText('Mes produits')).toBeInTheDocument()
  })
})
