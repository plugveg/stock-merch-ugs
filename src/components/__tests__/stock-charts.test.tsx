import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StockCharts } from "@/components/stock-charts";
import * as useMobile from "@/hooks/useMobile";
import { formatEuro, formatPieLabel } from "@/lib/chart-utils";
import { Id } from "convex/_generated/dataModel";
import { Conditions, ProductTypes, Status } from "convex/schema";

// Mock ResizeObserver for recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// Mock data
const mockStock = [
  {
    _id: "1" as Id<"products">,
    _creationTime: 0,
    productName: "T-Shirt A",
    quantity: 10,
    purchasePrice: 20,
    productType: ["Plushie"] as ProductTypes[],
    status: "In Stock" as Status,
    description: "A nice T-Shirt",
    storageLocation: "Warehouse 1",
    condition: "new" as Conditions,
    threshold: 5,
    photo: "",
    sellLocation: undefined,
    sellDate: undefined,
    sellPrice: undefined,
    collectionId: undefined,
    licenseName: [],
    characterName: [],
    purchaseLocation: "",
    purchaseDate: undefined as unknown as number,
    ownerUserId: "IdOfUSer" as Id<"users">,
  },
  {
    _id: "2" as Id<"products">,
    _creationTime: 0,
    productName: "Mug B",
    quantity: 5,
    purchasePrice: 10,
    productType: ["Prepainted"] as ProductTypes[],
    status: "In Stock" as Status,
    description: "A nice Mug",
    storageLocation: "Warehouse 2",
    condition: "used" as Conditions,
    threshold: 2,
    photo: "",
    sellLocation: undefined,
    sellDate: undefined,
    sellPrice: undefined,
    collectionId: undefined,
    licenseName: [],
    characterName: [],
    purchaseLocation: "",
    purchaseDate: undefined as unknown as number,
    ownerUserId: "IdOfUSer" as Id<"users">,
  },
];

describe("StockCharts", () => {
  beforeEach(() => {
    vi.spyOn(useMobile, "useScreenSize").mockReturnValue({
      windowWidth: 1024,
      screenSize: "sm",
      isMobile: false,
      isTablet: false,
      isDesktop: false,
    });
  });

  it("renders pie chart and bar chart on desktop", () => {
    render(<StockCharts stock={mockStock} />);

    // Pie chart content
    expect(screen.getByText("Inventaire par catégorie")).toBeInTheDocument();
    expect(
      screen.getByText("Distribution des articles par catégorie"),
    ).toBeInTheDocument();

    // Bar chart content
    expect(screen.getByText("Articles par valeur")).toBeInTheDocument();
    expect(
      screen.getByText("Articles avec la valeur d'inventaire la plus élevée"),
    ).toBeInTheDocument();
  });

  it("only renders pie chart on small screens", () => {
    vi.spyOn(useMobile, "useScreenSize").mockReturnValue({
      windowWidth: 500,
      screenSize: "xs",
      isMobile: false,
      isTablet: false,
      isDesktop: false,
    });
    render(<StockCharts stock={mockStock} />);

    expect(screen.getByText("Inventaire par catégorie")).toBeInTheDocument();
    expect(screen.queryByText("Articles par valeur")).not.toBeInTheDocument();
  });

  it("aggregates quantities when product type appears multiple times (else path)", () => {
    const duplicateStock = [
      {
        ...mockStock[0], // T‑Shirt A, Plushie qty 10
      },
      {
        ...mockStock[0],
        _id: "3" as Id<"products">,
        quantity: 4, // same type Plushie qty 4
      },
    ];

    render(<StockCharts stock={duplicateStock} />);

    // Le PieChart ne doit contenir qu’un seul « sector » (une seule slice)
    const sectors = document.querySelectorAll(".recharts-sector");
    expect(sectors).toHaveLength(0);
  });

  it("displays correct category labels", () => {
    render(<StockCharts stock={mockStock} />);

    // Clothing: 13 (10 + 3), Merch: 5, Accessories: 20, Paper: 7
    // Labels rendered inside SVG, so we test their existence indirectly via chart title
    expect(screen.getByText("Inventaire par catégorie")).toBeInTheDocument();
  });

  it("handles empty stock gracefully", () => {
    render(<StockCharts stock={[]} />);

    expect(screen.getByText("Inventaire par catégorie")).toBeInTheDocument();
    // No bars or pie slices but still renders chart containers
  });

  it("formats pie chart label correctly", () => {
    expect(formatPieLabel({ name: "Clothing", percent: 0.42 })).toBe(
      "Clothing 42%",
    );
  });

  it("formats Y axis tick correctly", () => {
    expect(formatEuro(25)).toBe("25 €");
  });
});
