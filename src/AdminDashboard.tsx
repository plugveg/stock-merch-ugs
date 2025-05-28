import { useState, FormEvent, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Conditions,
  getOptions,
  ProductTypes,
  Roles,
  roles,
  Status,
} from "../convex/schema";
import NavBar from "./components/navbar";
import { UserButton } from "@clerk/clerk-react";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { RoleBadge } from "./components/role-badge";
import Footer from "./components/footer";
import { Button } from "./components/ui/button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

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
  purchaseDate: number; // ISO date string
  purchasePrice: number;
  threshold: number;
  ownerUserId: Id<"users">;
  _id: Id<"products">;
}

export default function AdminDashboard() {
  const createEvent = useMutation(api.events.createEvent);
  const addUserToEvent = useMutation(api.events.addUserToEvent);
  const addProductToEventSale = useMutation(api.events.addProductToEventSale);
  const updateEventProductStatus = useMutation(
    api.events.updateEventProductStatus,
  );
  const removeProductFromEventSale = useMutation(
    api.events.removeProductFromEventSale,
  );

  const allEvents = useQuery(api.events.listEvents) || [];

  const myProducts = useQuery(api.functions.products.listMyProducts);
  const otherUserProducts = useQuery(
    api.functions.products.listAllProductsByStatus,
    { status: "For Event Sale" },
  );
  // Combine both product lists, removing duplicates
  const availableProducts = useMemo(() => {
    /// always treat missing data as an empty array
    const mine = myProducts ?? [];
    const others = otherUserProducts ?? [];

    const productMap = new Map<string, ProductFormData>();
    for (const p of mine) {
      productMap.set(p._id, p);
    }
    for (const p of others) {
      if (!productMap.has(p._id)) {
        productMap.set(p._id, p);
      }
    }
    return Array.from(productMap.values());
  }, [myProducts, otherUserProducts]);
  const allUsers = useQuery(api.users.listAllUsers) || []; // Using the new query

  const [newEventName, setNewEventName] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventStart, setNewEventStart] = useState("");
  const [newEventEnd, setNewEventEnd] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");

  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | null>(
    null,
  );
  const [userEmailToAdd, setUserEmailToAdd] = useState("");
  const [userRoleToAdd, setUserRoleToAdd] = useState<Roles>("Guest");

  const [productIdToAdd, setProductIdToAdd] = useState<Id<"products"> | "">("");
  const [salePrice, setSalePrice] = useState("");

  const eventDetails = useQuery(
    api.events.getEventDetails,
    selectedEventId ? { eventId: selectedEventId } : "skip",
  );
  const eventAnalytics = useQuery(
    api.analytics.getEventAnalytics,
    selectedEventId ? { eventId: selectedEventId } : "skip",
  );

  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEventName || !newEventStart || !newEventEnd) {
      alert("Veuillez renseigner le nom, la date/heure de début et de fin.");
      return;
    }
    try {
      await createEvent({
        name: newEventName,
        description: newEventDesc,
        startTime: new Date(newEventStart).getTime(),
        endTime: new Date(newEventEnd).getTime(),
        location: newEventLocation || "A déterminer",
      });
      setNewEventName("");
      setNewEventDesc("");
      setNewEventStart("");
      setNewEventEnd("");
      setNewEventLocation("");
      alert("Événement créé avec succès !");
    } catch (error) {
      console.error(error);
      alert(
        `	Erreur lors de la création de l'événement : ${(error as Error).message}`,
      );
    }
  };

  const handleAddUserToEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !userEmailToAdd) return;
    try {
      await addUserToEvent({
        eventId: selectedEventId,
        emailToAdd: userEmailToAdd,
        role: userRoleToAdd,
      });
      setUserEmailToAdd("");
      alert("	Utilisateur ajouté à l’événement !");
    } catch (error) {
      console.error(error);
      alert(
        `Erreur : l'utilisateur existe déjà ou autre problème : ${(error as Error).message}`,
      );
    }
  };

  const handleAddProductToSale = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !productIdToAdd || !salePrice) return;
    try {
      await addProductToEventSale({
        eventId: selectedEventId,
        productId: productIdToAdd as Id<"products">,
        salePrice: parseFloat(salePrice),
      });
      setProductIdToAdd("");
      setSalePrice("");
      alert("Produit ajouté à la vente de l'événement !");
    } catch (error) {
      console.error(error);
      alert(`Erreur lors de l'ajout du produit : ${(error as Error).message}`);
    }
  };

  const handleUpdateStatus = async (
    eventProductId: Id<"eventProducts">,
    status: Status,
  ) => {
    try {
      await updateEventProductStatus({ eventProductId, status });
      alert("Statut du produit mis à jour !");
    } catch (error) {
      console.error(error);
      alert(
        `Erreur lors de la mise à jour du statut : ${(error as Error).message}`,
      );
    }
  };

  const handleRemoveProduct = async (eventProductId: Id<"eventProducts">) => {
    if (
      !confirm(
        "Voulez-vous vraiment supprimer ce produit de la vente lors de l'événement ?",
      )
    )
      return;
    try {
      await removeProductFromEventSale({ eventProductId });
      alert("Produit supprimé de la vente de l’événement !");
    } catch (error) {
      console.error(error);
      alert(
        `Erreur lors de la suppression du produit : ${(error as Error).message}`,
      );
    }
  };

  const analyticsChartData = eventAnalytics
    ? {
        labels: ["En vente", "Vendus"],
        datasets: [
          {
            label: "Nombre de produits",
            data: [
              eventAnalytics.productsOnSaleCount,
              eventAnalytics.productsSoldCount,
            ],
            backgroundColor: [
              "rgba(54, 162, 235, 0.6)",
              "rgba(75, 192, 192, 0.6)",
            ],
          },
          {
            label: "Valeur totale (€)",
            data: [
              eventAnalytics.totalValueOnSale,
              eventAnalytics.totalValueSold,
            ],
            backgroundColor: [
              "rgba(255, 159, 64, 0.6)",
              "rgba(153, 102, 255, 0.6)",
            ],
          },
        ],
      }
    : { labels: [], datasets: [] };

  const { userInConvex } = useCurrentUser();

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 to-purple-100 flex flex-col">
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
      <main className="flex-1 p-4 md:p-6 mb-[80px] md:mb-[56px] mt-[140px] md:mt-[56px] space-y-8">
        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4 text-primary">
            Créer un nouvel événement
          </h2>
          <form
            onSubmit={handleCreateEvent}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              placeholder="Nom de l'événement"
              className="p-2 border rounded"
              required
            />
            <input
              type="text"
              value={newEventLocation}
              onChange={(e) => setNewEventLocation(e.target.value)}
              placeholder="Lieu de l’événement"
              className="p-2 border rounded"
              required
            />
            <input
              type="datetime-local"
              value={newEventStart}
              onChange={(e) => setNewEventStart(e.target.value)}
              placeholder="Date et heure de début"
              className="p-2 border rounded"
              required
            />
            <input
              type="datetime-local"
              value={newEventEnd}
              onChange={(e) => setNewEventEnd(e.target.value)}
              placeholder="Date et heure de fin"
              className="p-2 border rounded"
              required
            />
            <textarea
              value={newEventDesc}
              onChange={(e) => setNewEventDesc(e.target.value)}
              placeholder="Description de l'événement"
              className="p-2 border rounded md:col-span-2"
            />
            <Button
              type="submit"
              className="bg-primary text-white p-2 md:col-span-2"
            >
              Créer l'événement
            </Button>
          </form>
        </section>

        <section className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4 text-primary">
            Gérer l'événement
          </h2>
          <select
            onChange={(e) => setSelectedEventId(e.target.value as Id<"events">)}
            value={selectedEventId ?? ""}
            className="p-2 border rounded w-full mb-4"
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

          {selectedEventId && eventDetails && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Événement : {eventDetails.name}
                </h3>
                <p>{eventDetails.description}</p>
                <p>
                  Time: {new Date(eventDetails.startTime).toLocaleString()} -{" "}
                  {new Date(eventDetails.endTime).toLocaleString()}
                </p>
              </div>

              {/* Add User to Event */}
              <form
                onSubmit={handleAddUserToEvent}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
              >
                {/* Dropdown for selecting user by email/name from allUsers */}
                <select
                  value={userEmailToAdd}
                  onChange={(e) => setUserEmailToAdd(e.target.value)}
                  className="p-2 border rounded"
                  required
                >
                  <option value="" disabled>
                    Select User by Email & Nickname
                  </option>
                  {allUsers.map((user) => (
                    <option key={user._id} value={user.email!}>
                      {`${user.email} - ${user.nickname}`}
                    </option>
                  ))}
                </select>
                <select
                  value={userRoleToAdd}
                  onChange={(e) => setUserRoleToAdd(e.target.value as Roles)}
                  className="p-2 border rounded"
                >
                  {getOptions(roles).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <Button type="submit" className="self-center">
                  Add User
                </Button>
              </form>

              {/* Add Product to Event Sale */}
              <form
                onSubmit={handleAddProductToSale}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
              >
                <select
                  value={productIdToAdd}
                  onChange={(e) =>
                    setProductIdToAdd(e.target.value as Id<"products">)
                  }
                  className="p-2 border rounded"
                  required
                >
                  <option value="" disabled>
                    Select Product
                  </option>
                  {availableProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.productName} ({p.purchasePrice.toFixed(2)} €)
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Prix de vente"
                  className="p-2 border rounded"
                  required
                />
                <Button type="submit" className="self-center">
                  Ajouter le produit à la vente
                </Button>
              </form>

              {/* Event Products List */}
              <div>
                <h4 className="text-lg font-semibold mt-4 mb-2">
                  Produits à vendre durant l'événement :
                </h4>
                {eventDetails.products.length === 0 && (
                  <p>Pas encore de produits ajouter pour cet événement</p>
                )}
                <ul className="space-y-2">
                  {eventDetails.products.map((ep) => (
                    <li
                      key={ep._id}
                      className="p-3 border rounded-md shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">{ep.productName}</span> -
                        €{ep.salePrice ? ep.salePrice.toFixed(2) : "N/A"}{" "}
                        (Statut: {ep.status})
                      </div>
                      <div className="space-x-2">
                        {ep.status !== "Sold" && (
                          <Button
                            onClick={() => handleUpdateStatus(ep._id, "Sold")}
                            size={"sm"}
                            className="text-xs bg-red-500 text-white px-2 py-1"
                          >
                            Marquer comme vendu
                          </Button>
                        )}
                        {ep.status !== "On Sale" && (
                          <Button
                            onClick={() =>
                              handleUpdateStatus(ep._id, "On Sale")
                            }
                            size={"sm"}
                            className="text-xs bg-yellow-500 text-white px-2 py-1"
                          >
                            Marquer comme en vente
                          </Button>
                        )}
                        {ep.status !== "Reserved" && (
                          <Button
                            onClick={() =>
                              handleUpdateStatus(ep._id, "Reserved")
                            }
                            size={"sm"}
                            className="text-xs bg-gray-500 text-white px-2 py-1"
                          >
                            Marquer comme réservé
                          </Button>
                        )}
                        <Button
                          onClick={() => handleRemoveProduct(ep._id)}
                          size={"sm"}
                          className="text-xs bg-red-700 text-white px-2 py-1"
                        >
                          Retirer de la vente
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Event Participants List */}
              <div>
                <h4 className="text-lg font-semibold mt-4 mb-2">
                  Participants (
                  {eventAnalytics ? eventAnalytics.participantCount : 0}):
                </h4>
                <ul className="list-disc pl-5">
                  {eventAnalytics &&
                    eventAnalytics.participants.map((p) => (
                      <li key={p.userId}>
                        {p.nickname} ({p.role})
                      </li>
                    ))}
                </ul>
              </div>

              {/* Analytics */}
              {eventAnalytics && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Statistiques de l'événement : {eventAnalytics.eventName}
                  </h3>
                  <p>
                    Temps restant avant le début de l'évènement :{" "}
                    {Math.floor(
                      eventAnalytics.timeRemaining / (1000 * 60 * 60),
                    )}
                    h{" "}
                    {Math.floor(
                      (eventAnalytics.timeRemaining % (1000 * 60 * 60)) /
                        (1000 * 60),
                    )}
                    m
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center my-4">
                    <div className="p-4 bg-blue-100 rounded">
                      <p className="text-2xl font-bold">
                        {eventAnalytics.productsOnSaleCount}
                      </p>
                      <p>Produits en vente</p>
                    </div>
                    <div className="p-4 bg-green-100 rounded">
                      <p className="text-2xl font-bold">
                        {eventAnalytics.productsSoldCount}
                      </p>
                      <p>Produits vendus</p>
                    </div>
                    <div className="p-4 bg-orange-100 rounded">
                      <p className="text-2xl font-bold">
                        ${eventAnalytics.totalValueOnSale.toFixed(2)}
                      </p>
                      <p>Valeur totale en vente</p>
                    </div>
                    <div className="p-4 bg-purple-100 rounded">
                      <p className="text-2xl font-bold">
                        ${eventAnalytics.totalValueSold.toFixed(2)}
                      </p>
                      <p>Valeur totale vendue</p>
                    </div>
                  </div>
                  <div style={{ height: "400px" }}>
                    <Bar
                      data={analyticsChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "top" as const },
                          title: {
                            display: true,
                            text: "Statut et valeur des produits",
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
