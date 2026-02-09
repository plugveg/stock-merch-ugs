import { Infer, v } from 'convex/values'
import { defineSchema, defineTable } from 'convex/server'

// These constants are used to define the schema for the roles, conditions, status, and productTypes entities.
// They are used to validate the data that is being stored in the database. (ENUM)
export const roles = v.union(
  v.literal('Administrator'),
  v.literal('Board of directors'),
  v.literal('Founding members'),
  v.literal('Member representative'),
  v.literal('Member'),
  v.literal('Unregistered'),
  v.literal('Guest')
)

export const conditions = v.union(
  v.literal('New'),
  v.literal('Used'),
  v.literal('Damaged'),
  v.literal('Refurbished'),
  v.literal('Mint'),
  v.literal('Unopened'),
  v.literal('Sealed'),
  v.literal('Vintage'),
  v.literal('Limited Edition'),
  v.literal('Damaged Box'),
  v.literal('Damaged Item')
)

export const status = v.union(
  v.literal('In Stock'),
  v.literal('Sold'),
  v.literal('Reserved'),
  v.literal('Out of Stock'),
  v.literal('On Sale'),
  v.literal('In Collection'),
  v.literal('Archived'),
  v.literal('Pre-Order'),
  v.literal('In Auction'),
  v.literal('Pending'),
  v.literal('Shipped'),
  v.literal('Discontinued'),
  v.literal('For Event Sale')
)

export const productTypes = v.union(
  v.literal('Prepainted'),
  v.literal('Action/Doll'),
  v.literal('Trading Card'),
  v.literal('Garage Kit'),
  v.literal('Model Kit'),
  v.literal('Accessory'),
  v.literal('Plushie'),
  v.literal('Linen'),
  v.literal('Dish'),
  v.literal('Hanged up / On Wall'),
  v.literal('Apparel'),
  v.literal('Stationery'),
  v.literal('Books'),
  v.literal('Music'),
  v.literal('Video'),
  v.literal('Game'),
  v.literal('Software'),
  v.literal('Miscellaneous')
)

// This is the schema for the entities in the database.
export default defineSchema({
  collections: defineTable({
    collectionName: v.string(),
    numberOfGoodiesInCollection: v.number(),
    totalValue: v.number(),
    userId: v.id('users'), // Foreign key to user who owns this collection
  }),

  conditions: defineTable({
    name: conditions,
  }),

  eventParticipants: defineTable({
    eventId: v.id('events'),
    role: roles,
    userId: v.id('users'),
  })
    .index('by_eventId', ['eventId'])
    .index('by_userId', ['userId'])
    .index('by_eventId_and_userId', ['eventId', 'userId'])
    .index('by_eventId_and_role', ['eventId', 'role']),

  eventProducts: defineTable({
    eventId: v.id('events'),
    productId: v.id('products'),
    salePrice: v.optional(v.number()),
    status: status,
  })
    .index('by_eventId', ['eventId'])
    .index('by_productId', ['productId'])
    .index('by_eventId_and_productId', ['eventId', 'productId'])
    .index('by_eventId_and_status', ['eventId', 'status']),

  events: defineTable({
    adminId: v.id('users'),
    description: v.string(),
    endTime: v.number(),
    location: v.string(),
    name: v.string(),
    startTime: v.number(),
  }).index('by_adminId', ['adminId']),

  products: defineTable({
    characterName: v.array(v.string()),
    collectionId: v.optional(v.id('collections')),
    condition: conditions,
    description: v.string(),
    licenseName: v.array(v.string()),
    ownerUserId: v.id('users'),
    photo: v.optional(v.string()),
    productName: v.string(),
    productType: v.array(productTypes),
    purchaseDate: v.number(),
    purchaseLocation: v.string(),
    purchasePrice: v.number(),
    quantity: v.number(),
    sellDate: v.optional(v.number()),
    sellLocation: v.optional(v.string()),
    sellPrice: v.optional(v.number()),
    status: status,
    storageLocation: v.string(),
    threshold: v.number(),
  })
    .index('by_ownerId', ['ownerUserId'])
    .index('by_status', ['status'])
    .index('by_productType', ['productType']),

  productTypes: defineTable({
    name: productTypes,
  }),

  roles: defineTable({
    name: roles,
  }),

  status: defineTable({
    name: status,
  }),

  transactionProducts: defineTable({
    productId: v.id('products'),
    transactionId: v.id('transactions'),
  })
    .index('by_transaction', ['transactionId'])
    .index('by_product', ['productId'])
    .index('by_transaction_and_product', ['transactionId', 'productId']),

  transactions: defineTable({
    quantity: v.number(),
    soldDate: v.number(),
    soldLocation: v.string(),
    soldPrice: v.number(),
    transactionName: v.string(),
  }).index('by_soldDate', ['soldDate']),

  userBuyerTransactions: defineTable({
    buyerUserId: v.id('users'),
    transactionId: v.id('transactions'),
  })
    .index('by_buyer', ['buyerUserId'])
    .index('by_transaction', ['transactionId'])
    .index('by_buyer_and_transaction', ['buyerUserId', 'transactionId']),

  users: defineTable({
    email: v.string(),
    firstName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    lastName: v.optional(v.string()),
    nickname: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    // this the Clerk ID, stored in the subject JWT field
    externalId: v.string(),
    role: roles,
  })
    .index('email', ['email'])
    .index('byExternalId', ['externalId']),

  userSellerTransactions: defineTable({
    sellerUserId: v.id('users'),
    transactionId: v.id('transactions'),
  })
    .index('by_seller', ['sellerUserId'])
    .index('by_transaction', ['transactionId'])
    .index('by_seller_and_transaction', ['sellerUserId', 'transactionId']),
})

// This is a type-safe way to access the schema in your code.
export type Roles = Infer<typeof roles>
export type Conditions = Infer<typeof conditions>
export type Status = Infer<typeof status>
export type ProductTypes = Infer<typeof productTypes>

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
  interface LiteralMember {
    value: string
  }
  interface UnionValidator {
    validators?: unknown[]
    members?: LiteralMember[]
  }

  const anyVal = validator as UnionValidator
  if (Array.isArray(anyVal.members)) {
    return anyVal.members.map((member) => member.value)
  }
  return []
}
