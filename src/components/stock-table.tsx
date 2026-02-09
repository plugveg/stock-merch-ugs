import { useState } from 'react'
import { Doc, Id } from 'convex/_generated/dataModel'
import { MoreHorizontal, Edit, Trash2, ChevronUp, ChevronDown, Search, AlertCircle } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface StockTableProps {
  stock: Doc<'products'>[]
  onDelete: (id: Id<'products'>) => void
  onEdit: (item: Doc<'products'>) => void
}

type SortField = 'productName' | 'productType' | 'quantity' | 'purchasePrice'
type SortDirection = 'asc' | 'desc'

export function StockTable({ onDelete, onEdit, stock }: StockTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('productName')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort the stock items
  const filteredAndSortedStock = [...stock]
    .filter(
      (item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productType.some((pt) => pt.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      // normalise potential array values (e.g. productType) so the sort
      // behaves predictably for both string & numeric columns.
      const normalise = (val: unknown) => (Array.isArray(val) ? val.join(', ') : val)

      const aValue = normalise(a[sortField])
      const bValue = normalise(b[sortField])

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des articles… (par nom ou type)"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('productName')}>
                <div className="flex items-center">
                  Nom du produit
                  {sortField === 'productName' &&
                    (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('productType')}>
                <div className="flex items-center">
                  Type de produit
                  {sortField === 'productType' &&
                    (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('quantity')}>
                <div className="flex items-center justify-end">
                  Quantité
                  {sortField === 'quantity' &&
                    (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('purchasePrice')}>
                <div className="flex items-center justify-end">
                  Prix d'achat
                  {sortField === 'purchasePrice' &&
                    (sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead className="text-right">Date de création</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedStock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Aucun article trouvé. Essayez un autre terme de recherche.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedStock.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <div className="font-medium">{item.productName}</div>
                    {item.quantity <= item.threshold && (
                      <div className="flex items-center text-xs text-destructive mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Stock faible
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{item.productType.join(', ')}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.purchasePrice.toFixed(2)} €</TableCell>
                  <TableCell className="text-right">{new Date(item._creationTime).toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem data-testid="edit-item" onClick={() => onEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(item._id)}
                          data-testid="delete-item"
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
