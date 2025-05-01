import { defineEnt, defineEntSchema } from "convex-ents";
import { Infer, v } from "convex/values";

// These constants are used to define the schema for the roles, conditions, status, and productTypes entities.
// They are used to validate the data that is being stored in the database. (ENUM)
const roles = v.union(
  v.literal("Administrator"),
  v.literal("Board of directors"),
  v.literal("Founding members"),
  v.literal("Member representative"),
  v.literal("Member"),
  v.literal("Unregistered"),
  v.literal("Guest"),
);

const conditions = v.union(
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

const status = v.union(
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
);

const productTypes = v.union(
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
export default defineEntSchema({
  tasks: defineEnt({
    text: v.string(),
    isCompleted: v.boolean(),
  }),

  roles: defineEnt({}).field("name", roles, { default: "Guest" }),

  conditions: defineEnt({}).field("name", conditions, { default: "Used" }),

  status: defineEnt({}).field("name", status, { default: "In Stock" }),

  productTypes: defineEnt({}).field("name", productTypes, {
    default: "Action/Doll",
  }),

  users: defineEnt({
    firstName: v.string(),
    lastName: v.string(),
    nickname: v.string(),
    email: v.string(),
    password: v.string(),
  })
    .field("role", roles, { default: "Guest" })
    .index("by_email", ["email"])
    .edges("collections", { ref: true }) // Add this line to define the inverse relationship
    .edges("events"),

  products: defineEnt({
    productName: v.string(),
    description: v.string(),
    quantity: v.number(),
    photo: v.optional(v.string()), // Intended to store file paths as strings. Ensure consistency across the codebase.
    storageLocation: v.string(),
    condition: conditions,
    licenseName: v.array(v.string()),
    characterName: v.array(v.string()),
    productType: v.array(productTypes),
    status: status,
    purchaseLocation: v.string(),
    purchaseDate: v.number(), // Dates in Convex are typically stored as timestamps (numbers)
    purchasePrice: v.number(),
    sellLocation: v.optional(v.string()), // Optional since it might not be sold yet
    sellDate: v.optional(v.number()), // Optional since it might not be sold yet
    sellPrice: v.optional(v.number()), // Optional since it might not be sold yet
  })
    .index("by_status", ["status"])
    .index("by_productType", ["productType"])
    .edge("collection") // Add this line to define the inverse relationship
    .edges("events"),

  userProducts: defineEnt({
    ownerUserId: v.id("users"), // Foreign key to users table
    productId: v.id("products"), // Foreign key to products table
  })
    .index("by_owner", ["ownerUserId"]) // Index to find all products for a user
    .index("by_product", ["productId"]) // Index to find all users for a product
    .index("by_owner_and_product", ["ownerUserId", "productId"]), // Index for checking if a specific relationship exists

  transactions: defineEnt({
    transactionName: v.string(),
    quantity: v.number(),
    soldPrice: v.number(),
    soldDate: v.number(), // Dates in Convex are stored as timestamps (numbers)
    soldLocation: v.string(),
  })
    .index("by_soldDate", ["soldDate"]) // Index to query transactions by date
    .edge("event"), // Inverse edge to match events.edges("transactions", { ref: true })

  transactionProducts: defineEnt({
    transactionId: v.id("transactions"), // Foreign key to transactions table
    productId: v.id("products"), // Foreign key to products table
  })
    .index("by_transaction", ["transactionId"]) // Index to find all products in a transaction
    .index("by_product", ["productId"]) // Index to find all transactions for a product
    .index("by_transaction_and_product", ["transactionId", "productId"]), // Index for checking if a specific relationship exists

  userBuyerTransactions: defineEnt({
    transactionId: v.id("transactions"),
    buyerUserId: v.id("users"),
  })
    .index("by_buyer", ["buyerUserId"])
    .index("by_transaction", ["transactionId"])
    .index("by_buyer_and_transaction", ["buyerUserId", "transactionId"]),

  userSellerTransactions: defineEnt({
    transactionId: v.id("transactions"),
    sellerUserId: v.id("users"),
  })
    .index("by_seller", ["sellerUserId"])
    .index("by_transaction", ["transactionId"])
    .index("by_seller_and_transaction", ["sellerUserId", "transactionId"]),

  collections: defineEnt({})
    .field("collectionName", v.string())
    .field("totalValue", v.number(), { default: 0 }) // Using number for Float values
    .field("numberOfGoodiesInCollection", v.number(), { default: 0 }) // Using number for Int values
    // You might want to add a relationship to the user who owns this collection
    .edge("user") // Foreign key to users table
    // You might want to add a relationship to the products in this collection
    .edges("products", { ref: true }),

  events: defineEnt({})
    .field("eventName", v.string())
    .field("startDate", v.number()) // Dates in Convex are stored as timestamps (numbers)
    .field("endDate", v.number())
    .field("location", v.string())
    // You might want to add relationships to transactions that occurred at this event
    .edges("transactions", { ref: true })
    .edges("users")
    .edges("products"),
});

// This is a type-safe way to access the schema in your code.
export type Roles = Infer<typeof roles>;
export type Conditions = Infer<typeof conditions>;
export type Status = Infer<typeof status>;
export type ProductTypes = Infer<typeof productTypes>;
