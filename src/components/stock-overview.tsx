import { Doc } from 'convex/_generated/dataModel'
import { AlertCircle, ArrowUp, DollarSign, Package } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StockOverviewProps {
  stock: Doc<'products'>[]
}

export function StockOverview({ stock }: StockOverviewProps) {
  // Calculate total items
  const totalItems = stock.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate total value
  const totalValue = stock.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0)

  // Calculate low stock items
  const lowStockItems = stock.filter((item) => item.quantity <= item.threshold).length

  // Calculate categories
  const categories = new Set(stock.flatMap((item) => item.productType)).size

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Quantité totale de produits</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">À travers {stock.length} produits</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalValue.toFixed(2)} €</div>
          <p className="text-xs text-muted-foreground">Valeur du stock</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
          <AlertCircle className={`h-4 w-4 ${lowStockItems > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${lowStockItems > 0 ? 'text-destructive' : ''}`}>{lowStockItems}</div>
          <p className="text-xs text-muted-foreground">Articles sous le seuil</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Catégories</CardTitle>
          <ArrowUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categories}</div>
          <p className="text-xs text-muted-foreground">Catégories de produits</p>
        </CardContent>
      </Card>
    </>
  )
}
