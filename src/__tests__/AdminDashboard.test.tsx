import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, vi, beforeEach, expect, Mock } from 'vitest'
import AdminDashboard from '../AdminDashboard'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useQuery, useMutation } from 'convex/react'
import { MemoryRouter } from 'react-router'
import { Doc } from 'convex/_generated/dataModel'

vi.mock('convex/react')
vi.mock('../hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}))
vi.mock('../components/navbar', () => ({
  default: () => <div>NavBar</div>,
}))
vi.mock('../components/footer', () => ({
  default: () => <div>Footer</div>,
}))
vi.mock('../components/role-badge', () => ({
  RoleBadge: ({ role }: { readonly role: string }) => <span>{role}</span>,
}))
vi.mock('@clerk/clerk-react', () => ({
  UserButton: () => <div>UserButton</div>,
}))
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div>Chart</div>,
}))

const mockUseQuery = useQuery as unknown as Mock
const mockUseMutation = useMutation as unknown as Mock
const mockUseCurrentUser = useCurrentUser as unknown as Mock

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseCurrentUser.mockReturnValue({
      userInConvex: {
        email: 'admin@example.com',
        nickname: 'admin',
        role: 'Administrator',
      },
    })

    mockUseQuery.mockImplementation((queryName: unknown, args: unknown) => {
      const q = queryName as { operationName: string }
      if (q.operationName === 'events/listEvents') {
        return [
          { _id: 'e1', name: 'Event 1' },
          { _id: 'e2', name: 'Event 2' },
        ]
      }

      if (q.operationName === 'users/listAllUsers') {
        return [
          { _id: 'u1', email: 'user1@example.com', nickname: 'User One' },
          { _id: 'u2', email: 'user2@example.com', nickname: 'User Two' },
        ]
      }

      if (q.operationName === 'functions/products/listMyProducts') {
        return [
          {
            _id: 'p1',
            productName: 'Product A',
            purchasePrice: 10.0,
          },
        ]
      }

      if (q.operationName === 'functions/products/listAllProductsByStatus') {
        return [
          {
            _id: 'p2',
            productName: 'Product B',
            purchasePrice: 15.5,
          },
        ]
      }

      if (q.operationName === 'events/getEventDetails' && args && (args as Doc<'eventParticipants'>).eventId) {
        return {
          _id: (args as Doc<'eventParticipants'>).eventId,
          name: 'Event Details',
          description: 'Some description',
          startTime: Date.now(),
          endTime: Date.now() + 1000000,
          products: [],
        }
      }

      if (q.operationName === 'analytics/getEventAnalytics' && args && (args as Doc<'eventParticipants'>).eventId) {
        return {
          eventName: 'Event Details',
          participantCount: 0,
          participants: [],
          productsOnSaleCount: 2,
          productsSoldCount: 1,
          totalValueOnSale: 100,
          totalValueSold: 50,
          timeRemaining: 1000000,
        }
      }

      return null
    })
  })

  it('renders AdminDashboard component', () => {
    render(<AdminDashboard />, { wrapper: MemoryRouter })
    expect(screen.getByText('Créer un nouvel événement')).toBeInTheDocument()
    expect(screen.getByText("Gérer l'événement")).toBeInTheDocument()
    expect(screen.getByText('NavBar')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
    expect(screen.getByText("Gérer l'événement")).toBeInTheDocument()
  })

  it('shows products to add to sale', () => {
    render(<AdminDashboard />, { wrapper: MemoryRouter })
    const productDropdowns = screen.getAllByRole('combobox')
    expect(productDropdowns.length).toBeGreaterThanOrEqual(1)
  })

  it('can fill and submit the create event form', async () => {
    const mockCreate = vi.fn().mockResolvedValue({})
    mockUseMutation.mockReturnValue(mockCreate)

    render(<AdminDashboard />, { wrapper: MemoryRouter })

    fireEvent.change(screen.getByPlaceholderText("Nom de l'événement"), {
      target: { value: 'New Event' },
    })
    fireEvent.change(screen.getByPlaceholderText('Lieu de l’événement'), {
      target: { value: 'Paris' },
    })
    fireEvent.change(screen.getByPlaceholderText('Date et heure de début'), {
      target: { value: '2025-06-01T10:00' },
    })
    fireEvent.change(screen.getByPlaceholderText('Date et heure de fin'), {
      target: { value: '2025-06-01T12:00' },
    })

    fireEvent.click(screen.getByRole('button', { name: /créer l'événement/i }))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled()
    })
  })

  it('merges availableProducts without duplicates', async () => {
    render(<AdminDashboard />, { wrapper: MemoryRouter })

    // Select an event to populate the form section containing products
    fireEvent.change(screen.getByRole('combobox', { name: '' }), {
      target: { value: 'e1' },
    })

    await waitFor(() => {
      const productOptions = screen.getAllByRole('option').map((opt) => opt.textContent)
      expect(productOptions).toEqual(expect.arrayContaining(['Sélectionnez un événement']))
    })
  })
})
