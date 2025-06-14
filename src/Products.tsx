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
import { Info, Plus } from "lucide-react";
import { Doc } from "convex/_generated/dataModel";
import { RoleBadge } from "@/components/role-badge";
import { useUsersLite } from "./hooks/useUsersLite";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import Footer from "./components/footer";

export default function Products() {
  const { userInConvex } = useCurrentUser();
  const isAdmin =
    userInConvex?.role === "Administrator" ||
    userInConvex?.role === "Board of directors";
  /* Sélecteur d’utilisateur pour l’admin */
  const [selectedUserId, setSelectedUserId] = useState<
    Doc<"users">["_id"] | undefined
  >(isAdmin ? userInConvex?._id : undefined);

  const usersLite = useUsersLite(10);

  const { products, addProduct, updateProduct, deleteProduct } = useProducts({
    userId: selectedUserId,
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Doc<"products"> | null>(null);
  const [tabValue, setTabValue] = useState<"inventory" | "analytics">(
    "inventory",
  );

  // Memoize low stock items calculation
  const lowStockItems = useMemo(
    () =>
      products.filter(
        (item: { quantity: number; threshold: number }) =>
          item.quantity <= item.threshold,
      ),
    [products],
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 to-purple-100 flex flex-col mx-auto">
      <header>
        <NavBar>
          <UserButton aria-label="User menu" />
          {/* Badge rôle */}
          {userInConvex?.role && <RoleBadge role={userInConvex.role} />}
          {/* Texte identifiant */}
          <span className="content-center">
            Connecté en tant que {userInConvex?.nickname ?? userInConvex?.email}
          </span>
        </NavBar>
      </header>
      <main className="container mx-auto flex-1 p-4 md:p-6 mb-[80px] md:mb-[56px] mt-[140px] md:mt-[56px]">
        {/* Sélecteur d’utilisateur visible SEULEMENT pour l’admin */}
        {isAdmin && (
          <div className="mb-4 max-w-xs flex items-center gap-2">
            <Label className="text-sm font-medium mb-0 md:whitespace-nowrap">
              Sélectionner un utilisateur ou tous pour voir ses produits
            </Label>
            <Select
              value={selectedUserId ?? "all"}
              onValueChange={(val) =>
                setSelectedUserId(
                  val === "all" ? undefined : (val as Doc<"users">["_id"]),
                )
              }
            >
              <SelectTrigger className="border border-black">
                {selectedUserId === userInConvex?._id
                  ? userInConvex?.nickname
                  : usersLite?.results.find((u) => u._id === selectedUserId)
                      ?.label}
                {selectedUserId === undefined ? "Tous les utilisateurs" : ""}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                <SelectItem value={userInConvex?._id}>
                  {userInConvex?.nickname}
                </SelectItem>
                {usersLite?.results && <div className="border-t my-1" />}
                {usersLite?.results
                  .filter((u) => u._id !== userInConvex?._id) // ← retire l’utilisateur courant
                  .map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info
                    size={16}
                    className="hover:text-indigo-600 transition-colors"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    L'utilisateur sélectionné sera celui pour lequel vous allez
                    ajouter ou modifier les produits
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

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
          <div className="flex items-center justify-between flex-col gap-y-2 md:flex-row">
            <TabsList>
              <TabsTrigger value="inventory">Inventaire</TabsTrigger>
              <TabsTrigger value="analytics">Analyse</TabsTrigger>
            </TabsList>
            {tabValue === "inventory" && (
              <Button onClick={() => setAddDialogOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Button>
            )}
          </div>
          <TabsContent value="inventory" className="space-y-4">
            <ResponsiveDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              title="Ajouter un produit"
              description="Entrez les détails du nouveau produit"
              size="lg"
            >
              <StockForm
                onSubmit={(formData) =>
                  addProduct.mutate(
                    {
                      ...formData,
                      targetUserId: selectedUserId as
                        | Doc<"users">["_id"]
                        | undefined,
                    },
                    { onSuccess: () => setAddDialogOpen(false) },
                  )
                }
                onCancel={() => setAddDialogOpen(false)}
              />
            </ResponsiveDialog>

            <ResponsiveDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              title="Modifier un produit"
              description="Entrez les détails du produit"
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
                <CardTitle>Inventaire actuel</CardTitle>
                <CardDescription>
                  Managez vos produits.
                  {lowStockItems.length > 0 && (
                    <span className="text-destructive font-medium">
                      {lowStockItems.length} produits en-dessous du seuil
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
                <CardTitle>Analyse du stock</CardTitle>
                <CardDescription>
                  Représentation visuelle de votre inventaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StockCharts stock={products} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
