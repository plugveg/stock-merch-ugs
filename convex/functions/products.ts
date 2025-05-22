import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { productTypes, Status, status, conditions } from "../schema";

// CREATE: Add a new product
export const create = mutation({
  args: {
    productName: v.string(),
    description: v.string(),
    quantity: v.number(),
    photo: v.optional(v.string()),
    storageLocation: v.string(),
    condition: conditions, // Assuming conditions is a union of string literals
    licenseName: v.array(v.string()),
    characterName: v.array(v.string()),
    productType: v.array(productTypes), // Assuming productTypes is a union of string literals
    status: status, // Assuming status is a union of string literals
    purchaseLocation: v.string(),
    purchaseDate: v.number(),
    purchasePrice: v.number(),
    threshold: v.number(),
    sellLocation: v.optional(v.string()),
    sellDate: v.optional(v.number()),
    sellPrice: v.optional(v.number()),
    collectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, args) => {
    const productId = await ctx.db.insert("products", args);
    return productId;
  },
});

// READ: Get a single product by ID
export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    return product;
  },
});

// READ: List all products
export const list = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products;
  },
});

// READ: Get products by status using the index
export const getByStatus = query({
  args: { status },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", args.status as Status))
      .collect();
    return products;
  },
});

// READ: Get products by product type using the index
export const getByProductType = query({
  args: { productType: v.array(productTypes) },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_productType", (q) => q.eq("productType", args.productType))
      .collect();
    return products;
  },
});

// UPDATE: Update a product
export const update = mutation({
  args: {
    id: v.id("products"),
    // All fields are optional for updates
    productName: v.optional(v.string()),
    description: v.optional(v.string()),
    quantity: v.optional(v.number()),
    photo: v.optional(v.string()),
    storageLocation: v.optional(v.string()),
    condition: v.optional(conditions),
    licenseName: v.optional(v.array(v.string())),
    characterName: v.optional(v.array(v.string())),
    productType: v.optional(v.array(productTypes)),
    status: v.optional(status),
    purchaseLocation: v.optional(v.string()),
    purchaseDate: v.optional(v.number()),
    purchasePrice: v.optional(v.number()),
    threshold: v.optional(v.number()),
    sellLocation: v.optional(v.string()),
    sellDate: v.optional(v.number()),
    sellPrice: v.optional(v.number()),
    collectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;

    // Remove undefined fields
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    );

    await ctx.db.patch(id, patch);
    return id;
  },
});

// DELETE: Remove a product
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
