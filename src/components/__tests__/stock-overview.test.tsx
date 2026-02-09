import { describe, it, expect } from 'vitest'
import { Doc, Id } from 'convex/_generated/dataModel'
import { render, screen, within } from '@testing-library/react'
import { Conditions, ProductTypes, Status } from 'convex/schema'

import { StockOverview } from '@/components/stock-overview'

const mockStock: Doc<'products'>[] = [
  {
    _creationTime: 0,
    _id: { __tableName: 'products', id: '1' } as unknown as Id<'products'>,
    characterName: [],
    condition: 'New' as Conditions,
    description: '',
    licenseName: [],
    ownerUserId: 'IdOfUSer' as Id<'users'>,
    productName: 'Item A',
    productType: ['Plushie'] as ProductTypes[],
    purchaseDate: 0,
    purchaseLocation: '',
    purchasePrice: 10,
    quantity: 2,
    status: 'In Stock' as Status,
    storageLocation: '',
    threshold: 1,
  },
  {
    _creationTime: 0,
    _id: { __tableName: 'products', id: '2' } as unknown as Id<'products'>,
    characterName: [],
    condition: 'New' as Conditions,
    description: '',
    licenseName: [],
    ownerUserId: 'IdOfUSer' as Id<'users'>,
    productName: 'Item B',
    productType: ['Prepainted'] as ProductTypes[],
    purchaseDate: 0,
    purchaseLocation: '',
    purchasePrice: 5,
    quantity: 3,
    status: 'In Stock' as Status,
    storageLocation: '',
    threshold: 2,
  },
]

const lowStockMock = [
  {
    _creationTime: 0,
    _id: { __tableName: 'products', id: '3' } as unknown as Id<'products'>,
    characterName: [],
    condition: 'New' as Conditions,
    description: '',
    licenseName: [],
    ownerUserId: 'IdOfUSer' as Id<'users'>,
    productName: 'Item C',
    productType: ['Plushie'] as ProductTypes[],
    purchaseDate: 0,
    purchaseLocation: '',
    purchasePrice: 8,
    quantity: 1,
    status: 'In Stock' as Status,
    storageLocation: '',
    threshold: 2,
  },
]

describe('StockOverview', () => {
  it('renders total items and products count', () => {
    render(<StockOverview stock={mockStock} />)
    expect(screen.getByText('Quantité totale de produits')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // 2 + 3
    expect(screen.getByText('À travers 2 produits')).toBeInTheDocument()
  })

  it('renders total value correctly', () => {
    render(<StockOverview stock={mockStock} />)
    expect(screen.getByText('Valeur totale')).toBeInTheDocument()
    expect(screen.getByText('35.00 €')).toBeInTheDocument() // 2*10 + 3*5
  })

  it('renders low stock correctly when none are low', () => {
    render(<StockOverview stock={mockStock} />)
    expect(screen.getByText('Stock faible')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Articles sous le seuil')).toBeInTheDocument()
  })

  it('renders low stock correctly when some are low', () => {
    render(<StockOverview stock={lowStockMock} />)

    const lowStockCard = screen.getByText('Stock faible').closest("div[data-slot='card']")!
    const value = within(lowStockCard as HTMLElement).getByText('1')

    expect(value).toBeInTheDocument()
    expect(within(lowStockCard as HTMLElement).getByText('Articles sous le seuil')).toBeInTheDocument()
  })

  it('renders categories count correctly', () => {
    render(<StockOverview stock={mockStock} />)
    expect(screen.getByText('Catégories')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Catégories de produits')).toBeInTheDocument()
  })
})
