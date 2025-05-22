import NavBar from "@/components/navbar";
import { UserButton } from "@clerk/clerk-react";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { StockOverview } from "@/components/stock-overview";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { StockTable } from "@/components/stock-table";
import { StockForm } from "@/components/stock-form";
import { StockCharts } from "@/components/stock-charts";
import { useState, useMemo } from "react";
import useProducts from "./hooks/useProducts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Doc } from "convex/_generated/dataModel";

export default function Products() {
  const { userInConvex } = useCurrentUser();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Doc<"products"> | null>(null);
  const [tabValue, setTabValue] = useState<"inventory" | "analytics">(
    "inventory",
  );

  // Memoize low stock items calculation
  const lowStockItems = useMemo(
    () => products.filter((item) => item.quantity <= item.threshold),
    [products],
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 to-purple-100 flex flex-col mx-auto">
      <header>
        <NavBar>
          <UserButton aria-label="User menu" />
          Connecté en tant que {userInConvex?.nickname ?? userInConvex?.email}
        </NavBar>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StockOverview stock={products} />
        </div>

        <Tabs
          value={tabValue}
          onValueChange={(value: string) =>
            setTabValue(value as "inventory" | "analytics")
          }
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            {tabValue === "inventory" && (
              <Button onClick={() => setAddDialogOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            )}
          </div>
          <TabsContent value="inventory" className="space-y-4">
            <ResponsiveDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              title="Add New Item"
              description="Enter the details for the new stock item"
              size="lg"
            >
              <StockForm
                onSubmit={(data) => {
                  addProduct.mutate(data, {
                    onSuccess: () => setAddDialogOpen(false),
                  });
                }}
                onCancel={() => setAddDialogOpen(false)}
              />
            </ResponsiveDialog>

            <ResponsiveDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              title="Edit Item"
              description="Update the details for this stock item"
              size="lg"
            >
              <StockForm
                initialData={itemToEdit ?? undefined}
                onSubmit={(data) => {
                  const { _id, ...fields } = data;
                  updateProduct.mutate(
                    { id: _id, ...fields },
                    { onSuccess: () => setEditDialogOpen(false) },
                  );
                }}
                onCancel={() => setEditDialogOpen(false)}
              />
            </ResponsiveDialog>

            <Card>
              <CardHeader>
                <CardTitle>Current Inventory</CardTitle>
                <CardDescription>
                  Manage your stock items.
                  {lowStockItems.length > 0 && (
                    <span className="text-destructive font-medium">
                      {lowStockItems.length} items below threshold!
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StockTable
                  stock={products}
                  onEdit={(item) => {
                    setItemToEdit(item);
                    setEditDialogOpen(true);
                  }}
                  onDelete={(id) => deleteProduct.mutate({ id })}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Stock Analytics</CardTitle>
                <CardDescription>
                  Visual representation of your inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StockCharts stock={products} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
