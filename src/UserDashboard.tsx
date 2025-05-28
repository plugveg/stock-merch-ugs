import { useState, FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import NavBar from "./components/navbar";
import { UserButton } from "@clerk/clerk-react";
import { RoleBadge } from "./components/role-badge";
import { useCurrentUser } from "./hooks/useCurrentUser";
import Footer from "./components/footer";
import { StockForm } from "./components/stock-form";
import { ResponsiveDialog } from "./components/responsive-dialog";
import { Button } from "./components/ui/button";
import { Plus } from "lucide-react";
import { Conditions, ProductTypes, Status } from "convex/schema";

interface ProductFormData {
  productName: string;
  description: string;
  quantity: number;
  storageLocation: string;
  condition: Conditions;
  licenseName: string[];
  characterName: string[];
  productType: ProductTypes[];
  status: Status;
  purchaseLocation: string;
  /** UNIX timestamp en millisecondes */
  purchaseDate: number;
  purchasePrice: number;
  threshold: number;
  ownerUserId: Id<"users">;
}

export default function UserDashboard() {
  const { userInConvex } = useCurrentUser();
  const addProduct = useMutation(api.functions.products.create);
  const setProductAvailability = useMutation(
    api.functions.products.setProductAvailabilityForEvent,
  );
  const participateInEvent = useMutation(
    api.functions.products.participateInEvent,
  );
  const removeUserFromEvent = useMutation(api.events.removeUserFromEvent);
  const updateProduct = useMutation(api.functions.products.update);

  const myProducts = useQuery(api.functions.products.listMyProducts) || [];
  const allEvents = useQuery(api.events.listEvents) || [];
  const myEventsParticipation = useQuery(api.events.getMyEvents) || [];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddProduct = async (data: ProductFormData) => {
    try {
      await addProduct(data);
      setIsAddModalOpen(false);
      alert("Produit ajouté avec succès !");
    } catch (error) {
      console.error(error);
      alert(`Erreur lors de l'ajout du produit : ${(error as Error).message}`);
    }
  };

  const [selectedProductId, setSelectedProductId] = useState<
    Id<"products"> | ""
  >("");
  const [selectedEventIdForProduct, setSelectedEventIdForProduct] = useState<
    Id<"events"> | ""
  >("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [eventToParticipate, setEventToParticipate] = useState<
    Id<"events"> | ""
  >("");

  const handleSetAvailability = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedEventIdForProduct) return;

    try {
      // First, update the product status to "For Event Sale"
      if (isAvailable) {
        await updateProduct({
          id: selectedProductId as Id<"products">,
          status: "For Event Sale", // Set status to "For Event Sale"
        });
      } else {
        await updateProduct({
          id: selectedProductId as Id<"products">,
          status: "In Stock", // Reset status to "In Stock" if not available
        });
      }

      // Then set availability for the event
      await setProductAvailability({
        productId: selectedProductId as Id<"products">,
        eventId: selectedEventIdForProduct as Id<"events">,
        available: isAvailable,
      });

      alert(
        `Produit ${isAvailable ? "marqué disponible" : "retiré"} pour l'événement ! ${
          isAvailable
            ? "Les admins peuvent maintenant l'ajouter aux ventes."
            : ""
        }`,
      );

      // Reset form fields
      setSelectedProductId("");
      setSelectedEventIdForProduct("");
      setIsAvailable(true);
    } catch (error) {
      console.error(error);
      alert(`Erreur : ${(error as Error).message}`);
    }
  };

  const handleParticipate = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventToParticipate) return;
    try {
      await participateInEvent({ eventId: eventToParticipate as Id<"events"> });
      alert("Inscription à l'événement réussie !");
    } catch (error) {
      console.error(error);
      alert(`Erreur : ${(error as Error).message}`);
    }
  };

  const handleLeaveEvent = async (eventId: Id<"events">) => {
    if (!userInConvex?._id) {
      alert("Could not identify logged in user.");
      return;
    }
    if (!confirm("Are you sure you want to leave this event?")) return;
    try {
      await removeUserFromEvent({ eventId, userIdToRemove: userInConvex._id });
      alert("You have left the event.");
    } catch (error) {
      console.error(error);
      alert(`Error leaving event: ${(error as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 to-purple-100 flex flex-col">
      <header>
        <NavBar>
          <UserButton aria-label="User menu" />
          {userInConvex?.role && <RoleBadge role={userInConvex.role} />}
          <span className="content-center">
            Connecté en tant que {userInConvex?.nickname ?? userInConvex?.email}
          </span>
        </NavBar>
      </header>

      <main className="flex-1 p-4 md:p-6 mb-[80px] md:mb-[56px] mt-[140px] md:mt-[56px] space-y-8">
        <section className="p-6 bg-white rounded-lg shadow mx-auto w-3/4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-primary">
              Mes produits
            </h2>
            <Button onClick={() => setIsAddModalOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Button>
            <ResponsiveDialog
              open={isAddModalOpen}
              onOpenChange={setIsAddModalOpen}
              title="Ajouter un produit"
              description="Ajouter un nouveau produit à votre inventaire"
              size="lg"
            >
              <StockForm
                initialData={undefined}
                onSubmit={handleAddProduct}
                onCancel={() => setIsAddModalOpen(false)}
              />
            </ResponsiveDialog>
          </div>
          <ul className="space-y-2">
            {myProducts.length === 0 && (
              <p>Vous n'avez pas encore ajouté de produits.</p>
            )}
            {myProducts.map((product) => (
              <li key={product._id} className="p-3 border rounded-md shadow-sm">
                <h3 className="font-medium">
                  {product.productName} - {product.purchasePrice.toFixed(2)} €
                </h3>
                <p className="text-sm text-gray-600">{product.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="p-6 bg-white rounded-lg shadow mx-auto w-3/4">
          <h2 className="text-2xl font-semibold mb-4 text-primary">
            Gérer la disponibilité pour un événement
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            NB : Ceci exprime votre intérêt. Les admins de l'événement
            ajouteront les produits à la vente définitive.
          </p>
          <form
            onSubmit={handleSetAvailability}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <select
              value={selectedProductId}
              onChange={(e) =>
                setSelectedProductId(e.target.value as Id<"products">)
              }
              className="p-2 border rounded"
              required
            >
              <option value="" disabled>
                Sélectionnez votre produit
              </option>
              {myProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.productName}
                </option>
              ))}
            </select>
            <select
              value={selectedEventIdForProduct}
              onChange={(e) =>
                setSelectedEventIdForProduct(e.target.value as Id<"events">)
              }
              className="p-2 border rounded"
              required
            >
              <option value="" disabled>
                Sélectionnez un événement
              </option>
              {allEvents.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <label htmlFor="isAvailable" className="text-sm self-center">
                Rendre disponible :
              </label>
              <input
                type="checkbox"
                id="isAvailable"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="form-checkbox h-5 w-5 text-primary rounded"
              />
            </div>
            <Button type="submit" className=" text-white p-2 md:col-span-3">
              Confirmer la disponibilité
            </Button>
          </form>
        </section>

        <section className="p-6 bg-white rounded-lg shadow mx-auto w-3/4">
          <h2 className="text-2xl font-semibold mb-4 text-primary">
            Participer à un événement
          </h2>
          <form
            onSubmit={handleParticipate}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
          >
            <select
              value={eventToParticipate}
              onChange={(e) =>
                setEventToParticipate(e.target.value as Id<"events">)
              }
              className="p-2 border rounded"
              required
            >
              <option value="" disabled>
                Sélectionnez l'événement auquel participer
              </option>
              {allEvents.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
            <Button type="submit"> Confirmer la participation</Button>
          </form>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">
              Mes participations aux événements :
            </h3>
            {myEventsParticipation.length === 0 && (
              <p className="text-sm text-gray-500">
                Vous n'êtes pas encore inscrit pour un événement.
              </p>
            )}
            <ul className="list-disc pl-5 space-y-1">
              {myEventsParticipation.map((event) => (
                <li
                  key={event._id}
                  className="text-sm flex justify-between items-center"
                >
                  <span>
                    {event.name} (as {event.role})
                  </span>
                  <button
                    onClick={() => handleLeaveEvent(event._id)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Quitter l'événement
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
