import { render, screen, fireEvent, configure } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect, beforeAll } from "vitest";
import { StockTable } from "@/components/stock-table";
import { Doc, Id } from "convex/_generated/dataModel";
import { Conditions, ProductTypes, Status } from "convex/schema";

beforeAll(() => {
  configure({ defaultHidden: true });
});

const mockStock: Doc<"products">[] = [
  {
    _id: { __tableName: "products", id: "1" } as unknown as Id<"products">,
    _creationTime: Date.now(),
    productName: "T-Shirt",
    productType: ["Linen"] as ProductTypes[],
    quantity: 5,
    threshold: 10,
    purchasePrice: 20,
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
    _creationTime: Date.now(),
    productName: "Mug",
    productType: ["Plushie"] as ProductTypes[],
    quantity: 15,
    threshold: 5,
    purchasePrice: 8,
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

describe("StockTable", () => {
  let onEdit: ReturnType<typeof vi.fn>;
  let onDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onEdit = vi.fn();
    onDelete = vi.fn();
  });

  it("renders stock rows", () => {
    render(
      <StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />,
    );
    expect(screen.getByText("T-Shirt")).toBeInTheDocument();
    expect(screen.getByText("Mug")).toBeInTheDocument();
  });

  it("displays low stock indicator", () => {
    render(
      <StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />,
    );
    expect(screen.getByText(/low stock/i)).toBeInTheDocument();
  });

  it("filters items by search", () => {
    render(
      <StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />,
    );
    const input = screen.getByPlaceholderText(/search items/i);
    fireEvent.change(input, { target: { value: "Mug" } });
    expect(screen.getByText("Mug")).toBeInTheDocument();
    expect(screen.queryByText("T-Shirt")).not.toBeInTheDocument();
  });

  it("shows empty message if no match", () => {
    render(
      <StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />,
    );
    const input = screen.getByPlaceholderText(/search items/i);
    fireEvent.change(input, { target: { value: "XYZ" } });
    expect(screen.getByText(/no items found/i)).toBeInTheDocument();
  });

  it("sorts by quantity when column header is clicked", () => {
    render(
      <StockTable stock={mockStock} onEdit={onEdit} onDelete={onDelete} />,
    );
    const quantityHeader = screen.getByText("Quantity");
    fireEvent.click(quantityHeader); // sort ascending
    fireEvent.click(quantityHeader); // sort descending
    const firstRow = screen.getAllByRole("row")[1];
    expect(firstRow).toHaveTextContent("Mug");
  });
});
