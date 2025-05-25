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
    targetUserId: v.optional(v.id("users")), // admin → voir un autre user
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) throw new Error("Not authenticated");
    const meDoc = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", me.subject))
      .unique();

    if (!meDoc) throw new Error("User not found");

    const isAdmin = meDoc.role === "Administrator";
    const ownerId = args.targetUserId ?? meDoc._id;
    if (ownerId !== meDoc._id && !isAdmin)
      throw new Error("You cannot create products for someone else");
    // Remove targetUserId from the fields persisted in the product document
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { targetUserId: _ignored, ...rest } = args;

    const productId = await ctx.db.insert("products", {
      ...rest,
      ownerUserId: ownerId,
    });

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

export const listProducts = query({
  args: {
    targetUserId: v.optional(v.id("users")), // admin → voir un autre user
    pageSize: v.number(), // 10 ou 20
    cursor: v.optional(v.any()), // renvoyé par la page préc.
  },
  handler: async (ctx, { targetUserId, pageSize, cursor }) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) throw new Error("Not authenticated");

    const meDoc = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", me.subject))
      .unique();
    if (!meDoc) throw new Error("User not found");

    // Règles d’accès
    const canSeeAll = meDoc.role === "Administrator";
    const ownerId = targetUserId ?? (canSeeAll ? undefined : meDoc._id);

    let q;
    if (ownerId) {
      q = ctx.db
        .query("products")
        .withIndex("by_owner", (idx) => idx.eq("ownerUserId", ownerId));
    } else {
      q = ctx.db.query("products");
    }

    const { page, continueCursor } = await q
      .order("desc") // le plus récent d’abord
      .paginate({
        cursor,
        numItems: pageSize,
      });

    return { page, nextCursor: continueCursor };
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
    ownerUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) throw new Error("Not authenticated");
    const meDoc = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", me.subject))
      .unique();
    if (!meDoc) throw new Error("User not found");

    const isAdmin = meDoc.role === "Administrator";

    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    if (!isAdmin && product.ownerUserId !== meDoc._id) {
      throw new Error("You cannot update this product");
    }

    const { id, ownerUserId: desiredOwner, ...fields } = args;

    // Build the patch with only defined fields
    const patch: Record<string, unknown> = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    );

    if (desiredOwner !== undefined) {
      if (!isAdmin)
        throw new Error("Only administrators can change the ownerUserId");
      patch.ownerUserId = desiredOwner;
    }

    if (Object.keys(patch).length === 0) return id; // nothing to update

    await ctx.db.patch(id, patch);
    return id;
  },
});

// DELETE: Remove a product
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) throw new Error("Not authenticated");
    const meDoc = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", me.subject))
      .unique();
    if (!meDoc) throw new Error("User not found");

    const isAdmin = meDoc.role === "Administrator";

    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    if (!isAdmin && product.ownerUserId !== meDoc._id) {
      throw new Error("You cannot delete this product");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
