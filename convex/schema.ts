import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// These constants are used to define the schema for the roles, conditions, status, and productTypes entities.
// They are used to validate the data that is being stored in the database. (ENUM)
export const roles = v.union(
  v.literal("Administrator"),
  v.literal("Board of directors"),
  v.literal("Founding members"),
  v.literal("Member representative"),
  v.literal("Member"),
  v.literal("Unregistered"),
  v.literal("Guest"),
);

export const conditions = v.union(
  v.literal("New"),
  v.literal("Used"),
  v.literal("Damaged"),
  v.literal("Refurbished"),
  v.literal("Mint"),
  v.literal("Unopened"),
  v.literal("Sealed"),
  v.literal("Vintage"),
  v.literal("Limited Edition"),
  v.literal("Damaged Box"),
  v.literal("Damaged Item"),
);

export const status = v.union(
  v.literal("In Stock"),
  v.literal("Sold"),
  v.literal("Reserved"),
  v.literal("Out of Stock"),
  v.literal("On Sale"),
  v.literal("In Collection"),
  v.literal("Archived"),
  v.literal("Pre-Order"),
  v.literal("In Auction"),
  v.literal("Pending"),
  v.literal("Shipped"),
  v.literal("Discontinued"),
  v.literal("For Event Sale"),
);

export const productTypes = v.union(
  v.literal("Prepainted"),
  v.literal("Action/Doll"),
  v.literal("Trading Card"),
  v.literal("Garage Kit"),
  v.literal("Model Kit"),
  v.literal("Accessory"),
  v.literal("Plushie"),
  v.literal("Linen"),
  v.literal("Dish"),
  v.literal("Hanged up / On Wall"),
  v.literal("Apparel"),
  v.literal("Stationery"),
  v.literal("Books"),
  v.literal("Music"),
  v.literal("Video"),
  v.literal("Game"),
  v.literal("Software"),
  v.literal("Miscellaneous"),
);

// This is the schema for the entities in the database.
export default defineSchema({
  roles: defineTable({
    name: roles,
  }),

  conditions: defineTable({
    name: conditions,
  }),

  status: defineTable({
    name: status,
  }),

  productTypes: defineTable({
    name: productTypes,
  }),

  users: defineTable({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    nickname: v.optional(v.string()),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    // this the Clerk ID, stored in the subject JWT field
    externalId: v.string(),
    role: roles,
  })
    .index("email", ["email"])
    .index("byExternalId", ["externalId"]),

  products: defineTable({
    productName: v.string(),
    description: v.string(),
    quantity: v.number(),
    photo: v.optional(v.string()),
    storageLocation: v.string(),
    condition: conditions,
    licenseName: v.array(v.string()),
    characterName: v.array(v.string()),
    productType: v.array(productTypes),
    status: status,
    purchaseLocation: v.string(),
    purchaseDate: v.number(),
    purchasePrice: v.number(),
    threshold: v.number(),
    sellLocation: v.optional(v.string()),
    sellDate: v.optional(v.number()),
    sellPrice: v.optional(v.number()),
    collectionId: v.optional(v.id("collections")),
    ownerUserId: v.id("users"),
  })
    .index("by_ownerId", ["ownerUserId"])
    .index("by_status", ["status"])
    .index("by_productType", ["productType"]),

  transactions: defineTable({
    transactionName: v.string(),
    quantity: v.number(),
    soldPrice: v.number(),
    soldDate: v.number(),
    soldLocation: v.string(),
  }).index("by_soldDate", ["soldDate"]),

  transactionProducts: defineTable({
    transactionId: v.id("transactions"),
    productId: v.id("products"),
  })
    .index("by_transaction", ["transactionId"])
    .index("by_product", ["productId"])
    .index("by_transaction_and_product", ["transactionId", "productId"]),

  userBuyerTransactions: defineTable({
    transactionId: v.id("transactions"),
    buyerUserId: v.id("users"),
  })
    .index("by_buyer", ["buyerUserId"])
    .index("by_transaction", ["transactionId"])
    .index("by_buyer_and_transaction", ["buyerUserId", "transactionId"]),

  userSellerTransactions: defineTable({
    transactionId: v.id("transactions"),
    sellerUserId: v.id("users"),
  })
    .index("by_seller", ["sellerUserId"])
    .index("by_transaction", ["transactionId"])
    .index("by_seller_and_transaction", ["sellerUserId", "transactionId"]),

  collections: defineTable({
    collectionName: v.string(),
    totalValue: v.number(),
    numberOfGoodiesInCollection: v.number(),
    userId: v.id("users"), // Foreign key to user who owns this collection
  }),

  events: defineTable({
    name: v.string(),
    description: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    location: v.string(),
    adminId: v.id("users"),
  }).index("by_adminId", ["adminId"]),

  eventProducts: defineTable({
    eventId: v.id("events"),
    productId: v.id("products"),
    status: status,
    salePrice: v.optional(v.number()),
  })
    .index("by_eventId", ["eventId"])
    .index("by_productId", ["productId"])
    .index("by_eventId_and_productId", ["eventId", "productId"])
    .index("by_eventId_and_status", ["eventId", "status"]),

  eventParticipants: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    role: roles,
  })
    .index("by_eventId", ["eventId"])
    .index("by_userId", ["userId"])
    .index("by_eventId_and_userId", ["eventId", "userId"])
    .index("by_eventId_and_role", ["eventId", "role"]),
});

// This is a type-safe way to access the schema in your code.
export type Roles = Infer<typeof roles>;
export type Conditions = Infer<typeof conditions>;
export type Status = Infer<typeof status>;
export type ProductTypes = Infer<typeof productTypes>;

/**
 * Extracts the list of literal values from a Convex v.union validator.
 *
 * Usage:
 *   import schema, { getOptions } from './schema';
 *   const conditionOptions = getOptions(conditions);
 */
export function getOptions(validator: unknown): string[] {
  // Un v.union stocke ses validateurs membres dans la propriété `validators`
  // Chacun de ces membres (créé via v.literal) a une propriété `literal`
  type LiteralMember = { value: string };
  type UnionValidator = { validators?: unknown[]; members?: LiteralMember[] };

  const anyVal = validator as UnionValidator;
  if (Array.isArray(anyVal.members)) {
    return anyVal.members.map((member) => member.value);
  }
  return [];
}
