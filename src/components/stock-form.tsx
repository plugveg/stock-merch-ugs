import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import {
  conditions,
  status,
  productTypes,
  getOptions,
} from "../../convex/schema";
import { Doc } from "../../convex/_generated/dataModel";

interface StockFormProps {
  initialData?: Doc<"products">;
  onSubmit: (data: Doc<"products">) => void;
  onCancel: () => void;
}

export function StockForm({ initialData, onSubmit, onCancel }: StockFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.productName || "",
    description: initialData?.description || "",
    quantity: initialData?.quantity || 0,
    // photo: initialData?.photo || "",
    storageLocation: initialData?.storageLocation || "",
    condition: initialData?.condition || "",
    licenseName: initialData?.licenseName || ([] as string[]),
    characterName: initialData?.characterName || ([] as string[]),
    productType: initialData?.productType || ([] as string[]),
    status: initialData?.status || "",
    purchaseLocation: initialData?.purchaseLocation || "",
    purchaseDate: initialData?.purchaseDate
      ? new Date(initialData.purchaseDate).toISOString().slice(0, 10)
      : "",
    purchasePrice: initialData?.purchasePrice || 0,
    threshold: initialData?.threshold || 0,
    sellLocation: initialData?.sellLocation || "",
    sellDate: initialData?.sellDate
      ? new Date(initialData.sellDate).toISOString().slice(0, 10)
      : "",
    sellPrice: initialData?.sellPrice || 0,
    // Missing the possibily to link to a user's collection
  });

  // Toggle selection in productType array
  const toggleProductType = (type: string) => {
    const updated = formData.productType.includes(type)
      ? formData.productType.filter((t) => t !== type)
      : [...formData.productType, type];
    setFormData({ ...formData, productType: updated });
  };

  // Handle changes in array fields
  const handleArrayChange = (
    field: "licenseName" | "characterName",
    index: number,
    value: string,
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  // Add a new empty entry to an array field
  const addArrayField = (field: "licenseName" | "characterName") => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  // Remove an entry from an array field
  const removeArrayField = (
    field: "licenseName" | "characterName",
    index: number,
  ) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updated });
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number | File) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error when field is updated
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.storageLocation.trim()) {
      newErrors.storageLocation = "L'endroit de stockage est requis";
    }

    if (!formData.condition) {
      newErrors.condition = "La condition est requise";
    }

    if (!formData.status) {
      newErrors.status = "Le statut est requis";
    }

    if (
      formData.licenseName.length === 0 ||
      formData.licenseName.some((item: string) => !item.trim())
    ) {
      newErrors.licenseName = "Au moins une licence est requise";
    }

    if (
      formData.characterName.length === 0 ||
      formData.characterName.some((item: string) => !item.trim())
    ) {
      newErrors.characterName = "Au moins un personnage est requis";
    }

    if (!formData.purchaseLocation.trim()) {
      newErrors.purchaseLocation = "L'endroit d'achat est requis";
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = "La date d'achat est requise";
    }

    if (formData.productType.length === 0) {
      newErrors.productType = "Sélectionnez au moins un type de produit";
    }

    if (formData.quantity < 0) {
      newErrors.quantity = "La quantité ne peut pas être négative";
    }

    if (formData.threshold < 0) {
      newErrors.threshold = "Le seuil de stock bas ne peut pas être négatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Build payload with correct types and field names
      const payload = {
        productName: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        // photo: formData.photo || undefined,
        storageLocation: formData.storageLocation,
        condition: formData.condition,
        licenseName: formData.licenseName,
        characterName: formData.characterName,
        productType: formData.productType,
        status: formData.status,
        purchaseLocation: formData.purchaseLocation,
        // Convert "YYYY‑MM‑DD" to a Unix timestamp (ms). Cause Convex work with Unix timestamp (ms).
        purchaseDate: Date.parse(formData.purchaseDate),
        purchasePrice: formData.purchasePrice,
        threshold: formData.threshold,
        ...(initialData && {
          id: initialData._id,
          sellLocation: formData.sellLocation,
          sellDate: Date.parse(formData.sellDate),
          sellPrice: formData.sellPrice,
        }),
      };
      onSubmit(payload as Doc<"products">);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-2 px-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du produit*</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 px-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantité*</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              handleChange("quantity", Number.parseInt(e.target.value))
            }
            className={errors.quantity ? "border-destructive" : ""}
          />
          {errors.quantity && (
            <p className="text-xs text-destructive">{errors.quantity}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="storageLocation">Endroit de stockage*</Label>
          <Input
            id="storageLocation"
            value={formData.storageLocation}
            onChange={(e) => handleChange("storageLocation", e.target.value)}
            className={errors.storageLocation ? "border-destructive" : ""}
          />
          {errors.storageLocation && (
            <p className="text-xs text-destructive">{errors.storageLocation}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Condition*</Label>
          <Select
            value={formData.condition}
            onValueChange={(v) => handleChange("condition", v)}
          >
            <SelectTrigger id="condition" className="w-full">
              <SelectValue placeholder="Sélectionnez la condition" />
            </SelectTrigger>
            <SelectContent>
              {getOptions(conditions).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.condition && (
            <p className="text-xs text-destructive">{errors.condition}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Statut*</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => handleChange("status", v)}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Sélectionnez le statut" />
            </SelectTrigger>
            <SelectContent>
              {getOptions(status).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-xs text-destructive">{errors.status}</p>
          )}
        </div>

        {/* Multiple license names */}
        <div className="space-y-2 col-span-1 sm:col-span-2 mb-4">
          <Label htmlFor="licenseName">Licence(s)*</Label>
          {formData.licenseName.map(
            (
              value: string | number | readonly string[] | undefined,
              idx: number,
            ) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  id={`licenseName-${idx}`}
                  value={value}
                  onChange={(e) =>
                    handleArrayChange("licenseName", idx, e.target.value)
                  }
                  className="flex-1"
                  placeholder="Entrez un nom de licence"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeArrayField("licenseName", idx)}
                >
                  Supprimer
                </Button>
              </div>
            ),
          )}
          <Button
            type="button"
            onClick={() => addArrayField("licenseName")}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une licence
          </Button>
          {errors.licenseName && (
            <p className="text-xs text-destructive">{errors.licenseName}</p>
          )}
        </div>

        {/* Multiple character names */}
        <div className="space-y-2 col-span-1 sm:col-span-2 mb-4">
          <Label htmlFor="characterName">Personnage(s)*</Label>
          {formData.characterName.map(
            (
              value: string | number | readonly string[] | undefined,
              idx: number,
            ) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  id={`characterName-${idx}`}
                  value={value}
                  onChange={(e) =>
                    handleArrayChange("characterName", idx, e.target.value)
                  }
                  className="flex-1"
                  placeholder="Entrez un nom de personnage"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeArrayField("characterName", idx)}
                >
                  Supprimer
                </Button>
              </div>
            ),
          )}
          <Button
            type="button"
            onClick={() => addArrayField("characterName")}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un personnage
          </Button>
          {errors.characterName && (
            <p className="text-xs text-destructive">{errors.characterName}</p>
          )}
        </div>

        {/* Multiple product types */}
        <div className="space-y-2 col-span-1 sm:col-span-2 mb-4">
          <Label>Categorie(s) de produit*</Label>
          <div className="grid grid-cols-2 gap-2">
            {getOptions(productTypes).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={formData.productType.includes(type)}
                  onCheckedChange={() => toggleProductType(type)}
                />
                <label
                  htmlFor={type}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
          {errors.productType && (
            <p className="text-xs text-destructive">{errors.productType}</p>
          )}
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="photo">Photo du produit</Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleChange("photo", e.target.files[0]);
              }
            }}
          />
        </div> */}

        <div className="space-y-2">
          <Label htmlFor="purchaseLocation">Endroit d'achat*</Label>
          <Input
            id="purchaseLocation"
            value={formData.purchaseLocation}
            onChange={(e) => handleChange("purchaseLocation", e.target.value)}
            className={errors.purchaseLocation ? "border-destructive" : ""}
          />
          {errors.purchaseLocation && (
            <p className="text-xs text-destructive">
              {errors.purchaseLocation}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Date d'achat*</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => handleChange("purchaseDate", e.target.value)}
            className={errors.purchaseDate ? "border-destructive" : ""}
          />
          {errors.purchaseDate && (
            <p className="text-xs text-destructive">{errors.purchaseDate}</p>
          )}
        </div>

        <div className="space-y-2 content-end flex flex-col">
          <Label className="flex-auto" htmlFor="purchasePrice">
            Prix d'achat*
          </Label>
          <Input
            id="purchasePrice"
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) =>
              handleChange("purchasePrice", Number.parseFloat(e.target.value))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="threshold" className="gap-0 block">
            Seuil de stock bas*
            <span className="ml-1 text-xs text-muted-foreground">
              (Alertes si le stock est inférieur à ce nombre)
            </span>
          </Label>
          <Input
            id="threshold"
            type="number"
            value={formData.threshold}
            onChange={(e) =>
              handleChange("threshold", Number.parseInt(e.target.value))
            }
            className={errors.threshold ? "border-destructive" : ""}
          />
          {errors.threshold && (
            <p className="text-xs text-destructive">{errors.threshold}</p>
          )}
        </div>

        {initialData && (
          <>
            <div className="space-y-2">
              <Label htmlFor="sellDate">Date de vente</Label>
              <Input
                id="sellDate"
                type="date"
                value={formData.sellDate}
                onChange={(e) => handleChange("sellDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellPrice">Prix de vente</Label>
              <Input
                id="sellPrice"
                type="number"
                step="0.01"
                value={formData.sellPrice}
                onChange={(e) =>
                  handleChange("sellPrice", Number.parseFloat(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellLocation">Endroit de vente</Label>
              <Input
                id="sellLocation"
                value={formData.sellLocation}
                onChange={(e) => handleChange("sellLocation", e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {initialData ? "Mettre à jour le produit" : "Ajouter le produit"}
        </Button>
      </div>
    </form>
  );
}
