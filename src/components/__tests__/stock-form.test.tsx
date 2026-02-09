import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

import { StockForm } from '@/components/stock-form'

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {
      /* empty */
    }
    unobserve() {
      /* empty */
    }
    disconnect() {
      /* empty */
    }
  }

  // Radix UI Select uses this in its pointer logic – stub for JSDOM
  Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
    value: () => false,
  })

  // scrollIntoView is used by Radix when focusing options – stub for JSDOM
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: () => {
      /* empty */
    },
    writable: true,
  })
})

const mockOnSubmit = vi.fn()
const mockOnCancel = vi.fn()

import { Id } from 'convex/_generated/dataModel'
import { Conditions, ProductTypes, Status } from 'convex/schema'

const mockInitialData = {
  _creationTime: Date.now(),
  _id: { __tableName: 'products' } as Id<'products'>,
  characterName: ['Test Character'],
  condition: 'New' as Conditions,
  description: 'Test description',
  licenseName: ['Test License'],
  ownerUserId: 'IdOfUSer' as Id<'users'>,
  photo: '',
  productName: 'Test Product',
  productType: ['Prepainted'] as ProductTypes[],
  purchaseDate: new Date('2024-01-01').getTime(),
  purchaseLocation: 'Test Store',
  purchasePrice: 25.99,
  quantity: 10,
  sellDate: undefined,
  sellLocation: '',
  sellPrice: 0,
  status: 'In Stock' as Status,
  storageLocation: 'Test Location',
  threshold: 2,
}

const mockInitialDataWithSellDate = {
  ...mockInitialData,
  sellDate: new Date('2024-02-01').getTime(),
}

const mockInitialDataError = {
  _creationTime: Date.now(),
  _id: { __tableName: 'products' } as Id<'products'>,
  characterName: ['Test Character'],
  condition: 'New' as Conditions,
  description: 'dededed',
  licenseName: ['Test License'],
  ownerUserId: 'IdOfUSer' as Id<'users'>,
  photo: '',
  productName: '',
  productType: ['Prepainted'] as ProductTypes[],
  purchaseDate: new Date('2024-01-01').getTime(),
  purchaseLocation: 'Test Store',
  purchasePrice: -25.99,
  quantity: -1,
  sellDate: undefined,
  sellLocation: '',
  sellPrice: 0,
  status: 'In Stock' as Status,
  storageLocation: '',
  threshold: -2,
}

describe('StockForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form with initial data', () => {
    render(<StockForm initialData={mockInitialData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // Vérification que les champs sont pré-remplis avec les données initiales
    expect(screen.getByLabelText(/Nom du produit/i)).toHaveValue('Test Product')
    expect(screen.getByLabelText(/Quantité/i)).toHaveValue(10)
    expect(screen.getByLabelText(/Endroit de stockage/i)).toHaveValue('Test Location')
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Test description')
    expect(screen.getByLabelText(/Endroit d'achat/i)).toHaveValue('Test Store')
    expect(screen.getByLabelText(/Prix d'achat/i)).toHaveValue(25.99)
    expect(screen.getByLabelText(/Seuil de stock bas/i)).toHaveValue(2)

    // Vérification des champs supplémentaires pour la modification
    expect(screen.getByLabelText(/Date de vente/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Prix de vente/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Endroit de vente/i)).toBeInTheDocument()
  })

  it('prefills sellDate when initialData contains sellDate', () => {
    render(<StockForm initialData={mockInitialDataWithSellDate} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // Le champ doit être pré‑rempli au format ISO (YYYY‑MM‑DD)
    expect(screen.getByLabelText(/Date de vente/i)).toHaveValue('2024-02-01')
  })

  it('adds and removes licence fields', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // Ajouter une licence
    const addLicenceButton = screen.getByRole('button', {
      name: /Ajouter une licence/i,
    })
    await userEvent.click(addLicenceButton)

    // Vérifier qu'un champ a été ajouté
    const licenseFields = screen.getAllByPlaceholderText(/Entrez un nom de licence/i)
    expect(licenseFields).toHaveLength(1)

    // Ajouter une deuxième licence
    await userEvent.click(addLicenceButton)
    const updatedLicenseFields = screen.getAllByPlaceholderText(/Entrez un nom de licence/i)
    expect(updatedLicenseFields).toHaveLength(2)

    // Supprimer une licence
    const removeButtons = screen.getAllByRole('button', { name: /Supprimer/i })
    await userEvent.click(removeButtons[0])

    // Vérifier qu'un champ a été supprimé
    const remainingLicenseFields = screen.getAllByPlaceholderText(/Entrez un nom de licence/i)
    expect(remainingLicenseFields).toHaveLength(1)
  })

  // it("does not update photo when no file is selected (else path in handleChange)", async () => {
  //   render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

  //   const input = screen.getByLabelText(
  //     /Photo du produit/i,
  //   ) as HTMLInputElement;

  //   // Simule un change sans fichier sélectionné
  //   fireEvent.change(input, { target: { files: [] } });

  //   // Aucune mise à jour : le champ reste vide
  //   expect(input.files).toHaveLength(0);
  // });

  it('adds and removes character fields', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // Ajouter un personnage
    const addCharacterButton = screen.getByRole('button', {
      name: /Ajouter un personnage/i,
    })
    await userEvent.click(addCharacterButton)

    // Vérifier qu'un champ a été ajouté
    const characterFields = screen.getAllByPlaceholderText(/Entrez un nom de personnage/i)
    expect(characterFields).toHaveLength(1)

    // Ajouter un deuxième personnage
    await userEvent.click(addCharacterButton)
    const updatedCharacterFields = screen.getAllByPlaceholderText(/Entrez un nom de personnage/i)
    expect(updatedCharacterFields).toHaveLength(2)

    // Supprimer un personnage
    const removeButtons = screen.getAllByRole('button', { name: /Supprimer/i })
    await userEvent.click(removeButtons[0])

    // Vérifier qu'un champ a été supprimé
    const remainingCharacterFields = screen.getAllByPlaceholderText(/Entrez un nom de personnage/i)
    expect(remainingCharacterFields).toHaveLength(1)
  })

  it('toggles product type checkboxes', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // Trouver et cliquer sur un checkbox
    // Note: Puisque nous ne connaissons pas la liste exacte, nous allons simplement trouver le premier checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)

    // Vérifier l'état initial
    expect(checkboxes[0]).not.toBeChecked()

    // Cliquer sur le checkbox
    await userEvent.click(checkboxes[0])

    // Vérifier que l'état a changé
    expect(checkboxes[0]).toBeChecked()

    // Cliquer de nouveau pour désactiver
    await userEvent.click(checkboxes[0])

    // Vérifier que l'état a changé
    expect(checkboxes[0]).not.toBeChecked()
  })

  it('clears validation errors when fields are updated', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    // Soumettre le formulaire vide pour générer des erreurs
    const submitButton = screen.getByRole('button', {
      name: /Ajouter le produit/i,
    })
    await userEvent.click(submitButton)

    // Vérifier qu'une erreur s'affiche
    await waitFor(() => {
      expect(screen.getByText(/Le nom est requis/i)).toBeInTheDocument()
    })

    // Remplir un champ
    const nameInput = screen.getByLabelText(/Nom du produit/i)
    await userEvent.type(nameInput, 'Nouveau produit')

    // Vérifier que l'erreur a disparu
    await waitFor(() => {
      expect(screen.queryByText(/Le nom est requis/i)).not.toBeInTheDocument()
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /Annuler/i })
    await userEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('applies error styles to invalid fields', async () => {
    render(<StockForm initialData={mockInitialDataError} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await userEvent.click(screen.getByRole('button', { name: /Mettre à jour le produit/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/Nom du produit/i)).toHaveClass('border-destructive')
      expect(screen.getByLabelText(/Endroit de stockage/i)).toHaveClass('border-destructive')
      expect(screen.getByLabelText(/Quantité/i)).toHaveClass('border-destructive')
      expect(screen.getByLabelText(/Seuil de stock bas/i)).toHaveClass('border-destructive')
    })
  })

  it('submits sell data when editing', async () => {
    render(<StockForm initialData={mockInitialData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await userEvent.type(screen.getByLabelText(/Date de vente/i), '2024-02-01')
    await userEvent.type(screen.getByLabelText(/Prix de vente/i), '30')
    await userEvent.type(screen.getByLabelText(/Endroit de vente/i), 'Online Market')

    await userEvent.click(screen.getByRole('button', { name: /Mettre à jour le produit/i }))

    await waitFor(() => {
      const submittedData = mockOnSubmit.mock.calls[0][0]

      // The form normalises dates to a timestamp (ms since epoch)
      expect(submittedData.sellDate).toBe(new Date('2024-02-01').getTime())

      expect(submittedData.sellPrice).toBe(30)
      expect(submittedData.sellLocation).toBe('Online Market')
    })
  })

  // it("handles file upload", async () => {

  //   render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

  //   const file = new File(["test"], "test.png", { type: "image/png" });
  //   const input = screen.getByLabelText(
  //     /Photo du produit/i,
  //   ) as HTMLInputElement;

  //   await userEvent.upload(input, file);

  //   expect(input.files![0]).toBe(file);
  //   expect(input.files).toHaveLength(1);
  // });

  it('handles purchaseLocation field correctly', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const purchaseLocationInput = screen.getByLabelText(/Endroit d'achat/i)
    await userEvent.type(purchaseLocationInput, 'New Store')
    expect(purchaseLocationInput).toHaveValue('New Store')
  })

  it('handles purchaseDate field correctly', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const purchaseDateInput = screen.getByLabelText(/Date d'achat/i)
    await userEvent.type(purchaseDateInput, '2024-01-01')
    expect(purchaseDateInput).toHaveValue('2024-01-01')
  })

  it('handles purchasePrice field correctly', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const purchasePriceInput = screen.getByLabelText(/Prix d'achat/i)
    await userEvent.type(purchasePriceInput, '50')
    expect(purchasePriceInput).toHaveValue(50)
  })

  it('handles threshold field correctly', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const thresholdInput = screen.getByLabelText(/Seuil de stock bas/i)
    await userEvent.type(thresholdInput, '5')
    expect(thresholdInput).toHaveValue(5)
  })

  it('handles quantity field correctly', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const quantityInput = screen.getByLabelText(/Quantité/i)
    await userEvent.type(quantityInput, '20')
    expect(quantityInput).toHaveValue(20)
  })

  it('handles storageLocation field correctly', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const storageLocationInput = screen.getByLabelText(/Endroit de stockage/i)
    await userEvent.type(storageLocationInput, 'New Storage')
    expect(storageLocationInput).toHaveValue('New Storage')
  })

  it('handles description field correctly', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const descriptionInput = screen.getByLabelText(/Description/i)
    await userEvent.type(descriptionInput, 'New description')
    expect(descriptionInput).toHaveValue('New description')
  })

  it('handles condition field correctly', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const trigger = screen.getByLabelText(/Condition/i)
    await userEvent.click(trigger)

    const options = await screen.findAllByRole('option', { name: /^Used$/i })
    await userEvent.click(options[0])

    expect(trigger).toHaveTextContent('Used')
  })

  it('handles status field correctly', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    const trigger = screen.getByLabelText(/Statut/i)
    await userEvent.click(trigger)
    const options = await screen.findAllByRole('option', {
      name: /^Out of Stock$/i,
    })
    // Radix rend parfois deux nœuds (span + option). On clique sur l’élément ayant role option
    await userEvent.click(options[0])
    expect(trigger).toHaveTextContent('Out of Stock')
  })

  it('updates array fields correctly', async () => {
    render(<StockForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await userEvent.click(screen.getByRole('button', { name: /Ajouter une licence/i }))
    await userEvent.type(screen.getByPlaceholderText(/Entrez un nom de licence/i), 'New License')

    await userEvent.click(screen.getByRole('button', { name: /Ajouter un personnage/i }))
    await userEvent.type(screen.getByPlaceholderText(/Entrez un nom de personnage/i), 'New Character')

    expect(screen.getByPlaceholderText(/Entrez un nom de licence/i)).toHaveValue('New License')
    expect(screen.getByPlaceholderText(/Entrez un nom de personnage/i)).toHaveValue('New Character')
  })
})
