import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowUp, DollarSign, Package } from "lucide-react";

export type StockItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  threshold: number;
  lastUpdated: string;
};

interface StockOverviewProps {
  stock: StockItem[];
}

export function StockOverview({ stock }: StockOverviewProps) {
  // Calculate total items
  const totalItems = stock.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total value
  const totalValue = stock.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  // Calculate low stock items
  const lowStockItems = stock.filter(
    (item) => item.quantity <= item.threshold,
  ).length;

  // Calculate categories
  const categories = new Set(stock.map((item) => item.category)).size;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">
            Across {stock.length} products
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Inventory worth</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          <AlertCircle
            className={`h-4 w-4 ${lowStockItems > 0 ? "text-destructive" : "text-muted-foreground"}`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${lowStockItems > 0 ? "text-destructive" : ""}`}
          >
            {lowStockItems}
          </div>
          <p className="text-xs text-muted-foreground">Items below threshold</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <ArrowUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categories}</div>
          <p className="text-xs text-muted-foreground">Product categories</p>
        </CardContent>
      </Card>
    </>
  );
}
