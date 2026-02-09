import userEvent from '@testing-library/user-event'
import { Doc, Id } from 'convex/_generated/dataModel'
import { Conditions, ProductTypes, Status } from 'convex/schema'
import { describe, it, vi, beforeEach, expect, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor, configure } from '@testing-library/react'

import { StockTable } from '@/components/stock-table'

beforeAll(() => {
  configure({ defaultHidden: true })
})

const mockStock: Doc<'products'>[] = [
  {
    _creationTime: Date.now(),
    _id: { __tableName: 'products', id: '1' } as unknown as Id<'products'>,
    characterName: [],
    condition: 'New' as Conditions,
    description: '',
    licenseName: [],
    ownerUserId: 'IdOfUSer' as Id<'users'>,
    productName: 'T-Shirt',
    productType: ['Linen'] as ProductTypes[],
    purchaseDate: 0,
    purchaseLocation: '',
    purchasePrice: 20,
    quantity: 5,
    status: 'In Stock' as Status,
    storageLocation: '',
    threshold: 10,
  },
  {
    _creationTime: Date.now(),
    _id: { __tableName: 'products', id: '2' } as unknown as Id<'products'>,
    characterName: [],
    condition: 'New' as Conditions,
    description: '',
    licenseName: [],
    ownerUserId: 'IdOfUSer' as Id<'users'>,
    productName: 'Mug',
    productType: ['Plushie'] as ProductTypes[],
    purchaseDate: 0,
    purchaseLocation: '',
    purchasePrice: 8,
    quantity: 15,
    status: 'In Stock' as Status,
    storageLocation: '',
    threshold: 5,
  },
  {
    _creationTime: Date.now(),
    _id: { __tableName: 'products', id: '3' } as unknown as Id<'products'>,
    characterName: [],
    condition: 'New' as Conditions,
    description: '',
    licenseName: [],
    ownerUserId: 'IdOfUSer' as Id<'users'>,
    productName: 'Poster',
    productType: ['Accessory'] as ProductTypes[], // string, not array
    purchaseDate: 0,
    purchaseLocation: '',
    purchasePrice: 5,
    quantity: 2,
    status: 'In Stock' as Status,
    storageLocation: '',
    threshold: 1,
  },
]

describe('StockTable', () => {
  let onEdit: () => void
  let onDelete: () => void

  beforeEach(() => {
    onEdit = vi.fn()
    onDelete = vi.fn()
  })

  it('renders stock rows', () => {
    render(<StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('T-Shirt')).toBeInTheDocument()
    expect(screen.getByText('Mug')).toBeInTheDocument()
  })

  it('displays low stock indicator', () => {
    render(<StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText(/Stock faible/i)).toBeInTheDocument()
  })

  it('filters items by search', () => {
    render(<StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />)
    const input = screen.getByPlaceholderText(/Rechercher des articles/i)
    fireEvent.change(input, { target: { value: 'Mug' } })
    expect(screen.getByText('Mug')).toBeInTheDocument()
    expect(screen.queryByText('T-Shirt')).not.toBeInTheDocument()
  })

  it('shows empty message if no match', () => {
    render(<StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />)
    const input = screen.getByPlaceholderText(/Rechercher des articles/i)
    fireEvent.change(input, { target: { value: 'XYZ' } })
    expect(screen.getByText(/Aucun article trouvé/i)).toBeInTheDocument()
  })

  it('sorts by quantity when column header is clicked', () => {
    render(<StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />)
    const quantityHeader = screen.getByText('Quantité')
    fireEvent.click(quantityHeader) // sort ascending
    fireEvent.click(quantityHeader) // sort descending
    const firstRow = screen.getAllByRole('row')[1]
    expect(firstRow).toHaveTextContent('Mug')
  })

  it('toggles sort direction when the same header is clicked twice', () => {
    render(<StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />)
    // default sort is by productName ASC so the first data row should be "Mug"
    let firstRow = screen.getAllByRole('row')[1]
    expect(firstRow).toHaveTextContent('Mug')

    // click the header to toggle to DESC
    fireEvent.click(screen.getByText('Nom du produit'))

    firstRow = screen.getAllByRole('row')[1]
    expect(firstRow).toHaveTextContent('T-Shirt')

    // click the same header a second time to toggle back to ASC
    fireEvent.click(screen.getByText('Nom du produit'))

    // the first row should now be back to "Mug"
    firstRow = screen.getAllByRole('row')[1]
    expect(firstRow).toHaveTextContent('Mug')
  })

  it('sorts by productType string values in both directions', async () => {
    render(<StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />)
    const typeHeader = screen.getByText('Type de produit')

    // first click → ASC
    fireEvent.click(typeHeader)
    const firstRow = screen.getAllByRole('row')[1]
    // “Accessory” < “Linen” < “Plushie”
    expect(firstRow).toHaveTextContent('Poster') // “Accessory” comes before “Linen” and “Plushie”

    // second click → DESC
    fireEvent.click(typeHeader)
    await waitFor(() => {
      const firstRowAfter = screen.getAllByRole('row')[1]
      expect(firstRowAfter).toHaveTextContent('Mug')
    })
  })

  it('sorts by purchasePrice correctly', () => {
    render(<StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />)
    const priceHeader = screen.getByText("Prix d'achat")
    // first click ASC
    fireEvent.click(priceHeader)
    let firstRow = screen.getAllByRole('row')[1]
    expect(firstRow).toHaveTextContent('Poster')

    // second click DESC
    fireEvent.click(priceHeader)
    firstRow = screen.getAllByRole('row')[1]
    expect(firstRow).toHaveTextContent('T-Shirt')
  })

  it('joins productType array into a comma-separated string', () => {
    render(<StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('Linen')).toBeInTheDocument()
  })

  it('displays productType when it is a simple string and resets sort direction when switching column', () => {
    render(<StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />)

    // Poster row should show "Accessory" exactly once
    expect(screen.getByText('Accessory')).toBeInTheDocument()

    // Click on another sortable header to verify sortDirection resets to ASC
    const quantityHeader = screen.getByText('Quantité')
    fireEvent.click(quantityHeader) // first click sets sortDirection to ASC explicitly

    // Now switch to purchasePrice header; it should reset direction to ASC (i.e. smallest first)
    const priceHeader = screen.getByText("Prix d'achat")
    fireEvent.click(priceHeader)
    const firstRow = screen.getAllByRole('row')[1]
    expect(firstRow).toHaveTextContent('Poster') // 5 € is the lowest price
  })

  it('triggers onEdit and onDelete callbacks', async () => {
    const user = userEvent.setup()
    render(<StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />)

    // open dropdown of the first row
    const trigger = screen.getAllByRole('button', {
      name: /ouvrir le menu/i,
    })[0]
    await user.click(trigger)

    // wait for the menu items, then click Modifier and Supprimer
    const editItem = await screen.findByRole('menuitem', { name: /modifier/i })
    await user.click(editItem)
    expect(onEdit).toHaveBeenCalledTimes(1)

    // dropdown closes automatically; reopen to delete
    await user.click(trigger)
    const deleteItem = await screen.findByRole('menuitem', {
      name: /supprimer/i,
    })
    await user.click(deleteItem)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
