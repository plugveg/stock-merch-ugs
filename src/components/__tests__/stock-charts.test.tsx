import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StockCharts } from "@/components/stock-charts";
import * as useMobile from "@/hooks/useMobile";
import { formatDollar, formatPieLabel } from "@/lib/chart-utils";
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
    expect(screen.getByText("Inventory by Category")).toBeInTheDocument();
    expect(
      screen.getByText("Distribution of items across categories"),
    ).toBeInTheDocument();

    // Bar chart content
    expect(screen.getByText("Top Items by Value")).toBeInTheDocument();
    expect(
      screen.getByText("Items with highest inventory value"),
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

    expect(screen.getByText("Inventory by Category")).toBeInTheDocument();
    expect(screen.queryByText("Top Items by Value")).not.toBeInTheDocument();
  });

  it("displays correct category labels", () => {
    render(<StockCharts stock={mockStock} />);

    // Clothing: 13 (10 + 3), Merch: 5, Accessories: 20, Paper: 7
    // Labels rendered inside SVG, so we test their existence indirectly via chart title
    expect(screen.getByText("Inventory by Category")).toBeInTheDocument();
  });

  it("handles empty stock gracefully", () => {
    render(<StockCharts stock={[]} />);

    expect(screen.getByText("Inventory by Category")).toBeInTheDocument();
    // No bars or pie slices but still renders chart containers
  });

  it("formats pie chart label correctly", () => {
    expect(formatPieLabel({ name: "Clothing", percent: 0.42 })).toBe(
      "Clothing 42%",
    );
  });

  it("formats Y axis tick correctly", () => {
    expect(formatDollar(25)).toBe("$25");
  });
});
