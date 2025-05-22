import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StockOverview } from "@/components/stock-overview";
import { Doc, Id } from "convex/_generated/dataModel";
import { Conditions, ProductTypes, Status } from "convex/schema";

const mockStock: Doc<"products">[] = [
  {
    _id: { __tableName: "products", id: "1" } as unknown as Id<"products">,
    _creationTime: 0,
    productName: "Item A",
    productType: ["Prepainted"] as ProductTypes[],
    quantity: 2,
    threshold: 1,
    purchasePrice: 10,
    status: "In Stock" as Status,
    description: "",
    storageLocation: "",
    condition: "New" as Conditions,
    licenseName: [],
    characterName: [],
    purchaseLocation: "",
    purchaseDate: 0,
  },
  {
    _id: { __tableName: "products", id: "2" } as unknown as Id<"products">,
    _creationTime: 0,
    productName: "Item B",
    productType: ["Prepainted"] as ProductTypes[],
    quantity: 3,
    threshold: 2,
    purchasePrice: 5,
    status: "In Stock" as Status,
    description: "",
    storageLocation: "",
    condition: "New" as Conditions,
    licenseName: [],
    characterName: [],
    purchaseLocation: "",
    purchaseDate: 0,
  },
];

const lowStockMock = [
  {
    _id: { __tableName: "products", id: "3" } as unknown as Id<"products">,
    _creationTime: 0,
    productName: "Item C",
    quantity: 1,
    purchasePrice: 8,
    threshold: 2,
    productType: ["Plushie"] as ProductTypes[],
    status: "In Stock" as Status,
    description: "",
    storageLocation: "",
    condition: "New" as Conditions,
    licenseName: [],
    characterName: [],
    purchaseLocation: "",
    purchaseDate: 0,
  },
];

describe("StockOverview", () => {
  it("renders total items and products count", () => {
    render(<StockOverview stock={mockStock} />);
    expect(screen.getByText("Total Items")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // 2 + 3
    expect(screen.getByText("Across 2 products")).toBeInTheDocument();
  });

  it("renders total value correctly", () => {
    render(<StockOverview stock={mockStock} />);
    expect(screen.getByText("Total Value")).toBeInTheDocument();
    expect(screen.getByText("$35.00")).toBeInTheDocument(); // 2*10 + 3*5
  });

  it("renders low stock correctly when none are low", () => {
    render(<StockOverview stock={mockStock} />);
    expect(screen.getByText("Low Stock")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Items below threshold")).toBeInTheDocument();
  });

  it("renders low stock correctly when some are low", () => {
    render(<StockOverview stock={lowStockMock} />);

    const lowStockCard = screen
      .getByText("Low Stock")
      .closest("div[data-slot='card']")!;
    const value = within(lowStockCard as HTMLElement).getByText("1");

    expect(value).toBeInTheDocument();
    expect(
      within(lowStockCard as HTMLElement).getByText("Items below threshold"),
    ).toBeInTheDocument();
  });

  it("renders categories count correctly", () => {
    render(<StockOverview stock={mockStock} />);
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Product categories")).toBeInTheDocument();
  });
});
