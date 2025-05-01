# Help for the Convex functions directory

## Functions for userProducts

### Creating a Many-to-Many Relationship Between Users and Products

Here's how you can define this association table:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Your existing users and products tables would be here

  // Junction table for the many-to-many relationship
  userProducts: defineTable({
    ownerUserId: v.id("users"), // Foreign key to users table
    productId: v.id("products"), // Foreign key to products table
    // You can add additional fields related to this relationship if needed
  })
    .index("by_owner", ["ownerUserId"]) // Index to find all products for a user
    .index("by_product", ["productId"]) // Index to find all users for a product
    .index("by_owner_and_product", ["ownerUserId", "productId"]), // Index for checking if a specific relationship exists
});
```

This schema follows the best practices for modeling many-to-many relationships in Convex as described in [Relationship Structures: Let's Talk About Schemas](https://stack.convex.dev/relationship-structures-let-s-talk-about-schemas#many-to-many).

### Using the Many-to-Many Relationship

With this structure, you can:

1. Find all products owned by a user:

```typescript
const userProducts = await ctx.db
  .query("userProducts")
  .withIndex("by_owner", (q) => q.eq("ownerUserId", userId))
  .collect();
const productIds = userProducts.map((up) => up.productId);
const products = await Promise.all(productIds.map((id) => ctx.db.get(id)));
```

2. Find all users who own a specific product:

```typescript
const userProducts = await ctx.db
  .query("userProducts")
  .withIndex("by_product", (q) => q.eq("productId", productId))
  .collect();
const userIds = userProducts.map((up) => up.ownerUserId);
const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
```

3. Check if a user owns a specific product:

```typescript
const relationship = await ctx.db
  .query("userProducts")
  .withIndex("by_owner_and_product", (q) =>
    q.eq("ownerUserId", userId).eq("productId", productId),
  )
  .first();
const userOwnsProduct = relationship !== null;
```

You can also use the relationship helpers from the Convex helpers library to simplify these operations, as described in [Database Relationship Helpers](https://stack.convex.dev/functional-relationships-helpers#many-to-many).

---

## Functions for Transactions, Products, Buyers, and Sellers

Here are the functions for creating, retrieving, and managing these relationships:

```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import {
  getAll,
  getManyFrom,
  getManyVia,
} from "convex-helpers/server/relationships";

// --- Transaction-Product Relationships ---

// Create a relationship between a transaction and a product
export const linkTransactionToProduct = mutation({
  args: {
    transactionId: v.id("transactions"),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Verify that both the transaction and product exist
    const transaction = await ctx.db.get(args.transactionId);
    const product = await ctx.db.get(args.productId);

    if (!transaction || !product) {
      throw new Error("Transaction or product not found");
    }

    // Create the relationship
    return await ctx.db.insert("transactionProducts", {
      transactionId: args.transactionId,
      productId: args.productId,
    });
  },
});

// Get all products for a transaction
export const getProductsForTransaction = query({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    // Use the getManyVia helper to get products via the junction table
    return await getManyVia(
      ctx.db,
      "transactionProducts",
      "productId",
      "transactionId",
      args.transactionId,
    );
  },
});

// Get all transactions for a product
export const getTransactionsForProduct = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Use the getManyVia helper to get transactions via the junction table
    return await getManyVia(
      ctx.db,
      "transactionProducts",
      "transactionId",
      "productId",
      args.productId,
    );
  },
});

// --- Buyer-Transaction Relationships ---

// Link a buyer to a transaction
export const linkBuyerToTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    buyerUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify that both the transaction and user exist
    const transaction = await ctx.db.get(args.transactionId);
    const buyer = await ctx.db.get(args.buyerUserId);

    if (!transaction || !buyer) {
      throw new Error("Transaction or buyer not found");
    }

    // Create the relationship
    return await ctx.db.insert("userBuyerTransactions", {
      transactionId: args.transactionId,
      buyerUserId: args.buyerUserId,
    });
  },
});

// Get all transactions for a buyer
export const getTransactionsForBuyer = query({
  args: {
    buyerUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Use the getManyVia helper to get transactions via the junction table
    return await getManyVia(
      ctx.db,
      "userBuyerTransactions",
      "transactionId",
      "buyerUserId",
      args.buyerUserId,
    );
  },
});

// Get the buyer for a transaction
export const getBuyerForTransaction = query({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const buyerRelation = await ctx.db
      .query("userBuyerTransactions")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId),
      )
      .first();

    if (!buyerRelation) {
      return null;
    }

    return await ctx.db.get(buyerRelation.buyerUserId);
  },
});

// --- Seller-Transaction Relationships ---

// Link a seller to a transaction
export const linkSellerToTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    sellerUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify that both the transaction and user exist
    const transaction = await ctx.db.get(args.transactionId);
    const seller = await ctx.db.get(args.sellerUserId);

    if (!transaction || !seller) {
      throw new Error("Transaction or seller not found");
    }

    // Create the relationship
    return await ctx.db.insert("userSellerTransactions", {
      transactionId: args.transactionId,
      sellerUserId: args.sellerUserId,
    });
  },
});

// Get all transactions for a seller
export const getTransactionsForSeller = query({
  args: {
    sellerUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Use the getManyVia helper to get transactions via the junction table
    return await getManyVia(
      ctx.db,
      "userSellerTransactions",
      "transactionId",
      "sellerUserId",
      args.sellerUserId,
    );
  },
});

// Get the seller for a transaction
export const getSellerForTransaction = query({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const sellerRelation = await ctx.db
      .query("userSellerTransactions")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId),
      )
      .first();

    if (!sellerRelation) {
      return null;
    }

    return await ctx.db.get(sellerRelation.sellerUserId);
  },
});

// --- Complete Transaction Creation ---

// Create a complete transaction with products, buyer, and seller
export const createCompleteTransaction = mutation({
  args: {
    transactionName: v.string(),
    quantity: v.number(),
    soldPrice: v.number(),
    soldDate: v.number(),
    soldLocation: v.string(),
    productId: v.id("products"),
    buyerUserId: v.id("users"),
    sellerUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify that the product, buyer, and seller exist
    const product = await ctx.db.get(args.productId);
    const buyer = await ctx.db.get(args.buyerUserId);
    const seller = await ctx.db.get(args.sellerUserId);

    if (!product || !buyer || !seller) {
      throw new Error("Product, buyer, or seller not found");
    }

    // Create the transaction
    const transactionId = await ctx.db.insert("transactions", {
      transactionName: args.transactionName,
      quantity: args.quantity,
      soldPrice: args.soldPrice,
      soldDate: args.soldDate,
      soldLocation: args.soldLocation,
    });

    // Create the relationships
    await ctx.db.insert("transactionProducts", {
      transactionId,
      productId: args.productId,
    });

    await ctx.db.insert("userBuyerTransactions", {
      transactionId,
      buyerUserId: args.buyerUserId,
    });

    await ctx.db.insert("userSellerTransactions", {
      transactionId,
      sellerUserId: args.sellerUserId,
    });

    return transactionId;
  },
});

// Get complete transaction details
export const getCompleteTransaction = query({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);

    if (!transaction) {
      return null;
    }

    // Get related products
    const products = await getManyVia(
      ctx.db,
      "transactionProducts",
      "productId",
      "transactionId",
      args.transactionId,
    );

    // Get buyer
    const buyerRelation = await ctx.db
      .query("userBuyerTransactions")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId),
      )
      .first();

    const buyer = buyerRelation
      ? await ctx.db.get(buyerRelation.buyerUserId)
      : null;

    // Get seller
    const sellerRelation = await ctx.db
      .query("userSellerTransactions")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId),
      )
      .first();

    const seller = sellerRelation
      ? await ctx.db.get(sellerRelation.sellerUserId)
      : null;

    return {
      ...transaction,
      products,
      buyer,
      seller,
    };
  },
});
```

These functions follow the patterns described in [Database Relationship Helpers](https://stack.convex.dev/functional-relationships-helpers) and [Relationship Structures: Let's Talk About Schemas](https://stack.convex.dev/relationship-structures-let-s-talk-about-schemas#many-to-many).

This approach leverages Convex's transaction system to ensure data integrity while providing a clean API for working with your relationships.

---

## Using Indexes in Convex Queries for Transactions, Products, Buyers, and Sellers

### Can I use `withIndex` in my get functions?

Yes, you can definitely use `withIndex` in your get functions to improve query performance. In fact, it's a best practice to use indexes when querying your Convex database, especially as your tables grow larger.

Let's modify some of the get functions from the previous examples to use indexes more explicitly:

```typescript
// Get all products for a transaction
export const getProductsForTransaction = query({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    // Using withIndex explicitly
    const relationships = await ctx.db
      .query("transactionProducts")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId),
      )
      .collect();

    // Get all the products
    return await Promise.all(
      relationships.map((rel) => ctx.db.get(rel.productId)),
    );
  },
});

// Get the buyer for a transaction
export const getBuyerForTransaction = query({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const buyerRelation = await ctx.db
      .query("userBuyerTransactions")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId),
      )
      .unique();

    if (!buyerRelation) {
      return null;
    }

    return await ctx.db.get(buyerRelation.buyerUserId);
  },
});
```

Using `withIndex` is more efficient than using `.filter()` because it allows Convex to use the index data structure to quickly find the relevant documents rather than scanning the entire table [Queries that scale](https://stack.convex.dev/queries-that-scale#1-fetching-exactly-what-you-need-with-indexes).

The performance of a query using an index is based on how many documents are in the index range, not the total size of the table. This makes indexed queries much more scalable as your database grows [Introduction to Indexes and Query Performance](https://docs.convex.dev/database/reading-data/indexes/indexes-and-query-perf#conclusions).

Remember that when using compound indexes (indexes on multiple fields), you must reference the fields in the same order they appear in the index definition, starting with the first field [Introduction to Indexes and Query Performance](https://docs.convex.dev/database/reading-data/indexes/indexes-and-query-perf#indexing-multiple-fields).
