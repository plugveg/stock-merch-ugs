/* eslint-disable no-console */
import { v } from 'convex/values'

import { mutation, query } from '../_generated/server'
import { productTypes, Status, status, conditions, Roles } from '../schema'

// CREATE: Add a new product
export const create = mutation({
  args: {
    characterName: v.array(v.string()),
    collectionId: v.optional(v.id('collections')),
    condition: conditions, // Assuming conditions is a union of string literals
    description: v.string(),
    licenseName: v.array(v.string()),
    photo: v.optional(v.string()),
    productName: v.string(),
    productType: v.array(productTypes), // Assuming productTypes is a union of string literals
    purchaseDate: v.number(),
    purchaseLocation: v.string(),
    purchasePrice: v.number(),
    quantity: v.number(),
    sellDate: v.optional(v.number()),
    sellLocation: v.optional(v.string()),
    sellPrice: v.optional(v.number()),
    status: status, // Assuming status is a union of string literals
    storageLocation: v.string(),
    targetUserId: v.optional(v.id('users')), // admin → voir un autre user
    threshold: v.number(),
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity()
    if (!me) throw new Error('Not authenticated')
    const meDoc = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', me.subject))
      .unique()

    if (!meDoc) throw new Error('User not found')

    const isAdmin = meDoc.role === 'Administrator'
    const ownerId = args.targetUserId ?? meDoc._id
    if (ownerId !== meDoc._id && !isAdmin) throw new Error('You cannot create products for someone else')
    // Remove targetUserId from the fields persisted in the product document
    const { targetUserId: _ignored, ...rest } = args

    const productId = await ctx.db.insert('products', {
      ...rest,
      ownerUserId: ownerId,
    })

    return productId
  },
})

// READ: Get a single product by ID
export const getById = query({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id)
    return product
  },
})

// READ: List all products
export const list = query({
  handler: async (ctx) => {
    const products = await ctx.db.query('products').collect()
    return products
  },
})

export const listAllProductsByStatus = query({
  args: { status: status },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_status', (q) => q.eq('status', args.status as Status))
      .collect()
    return products
  },
})

// READ: Get products by status using the index
export const getByStatus = query({
  args: { status },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_status', (q) => q.eq('status', args.status as Status))
      .collect()
    return products
  },
})

// READ: Get products by product type using the index
export const getByProductType = query({
  args: { productType: v.array(productTypes) },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_productType', (q) => q.eq('productType', args.productType))
      .collect()
    return products
  },
})

export const listProducts = query({
  args: {
    cursor: v.optional(v.any()), // renvoyé par la page préc.
    pageSize: v.number(), // 10 ou 20
    targetUserId: v.optional(v.id('users')), // admin → voir un autre user
  },
  handler: async (ctx, { cursor, pageSize, targetUserId }) => {
    const me = await ctx.auth.getUserIdentity()
    if (!me) throw new Error('Not authenticated')

    const meDoc = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', me.subject))
      .unique()
    if (!meDoc) throw new Error('User not found')

    // Règles d’accès
    const canSeeAll = meDoc.role === 'Administrator'
    const ownerId = targetUserId ?? (canSeeAll ? undefined : meDoc._id)

    let q
    if (ownerId) {
      q = ctx.db.query('products').withIndex('by_ownerId', (idx) => idx.eq('ownerUserId', ownerId))
    } else {
      q = ctx.db.query('products')
    }

    const { continueCursor, page } = await q
      .order('desc') // le plus récent d’abord
      .paginate({
        cursor,
        numItems: pageSize,
      })

    return { nextCursor: continueCursor, page }
  },
})

// UPDATE: Update a product
export const update = mutation({
  args: {
    id: v.id('products'),
    // All fields are optional for updates
    characterName: v.optional(v.array(v.string())),
    collectionId: v.optional(v.id('collections')),
    condition: v.optional(conditions),
    description: v.optional(v.string()),
    licenseName: v.optional(v.array(v.string())),
    ownerUserId: v.optional(v.id('users')),
    photo: v.optional(v.string()),
    productName: v.optional(v.string()),
    productType: v.optional(v.array(productTypes)),
    purchaseDate: v.optional(v.number()),
    purchaseLocation: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    quantity: v.optional(v.number()),
    sellDate: v.optional(v.number()),
    sellLocation: v.optional(v.string()),
    sellPrice: v.optional(v.number()),
    status: v.optional(status),
    storageLocation: v.optional(v.string()),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity()
    if (!me) throw new Error('Not authenticated')
    const meDoc = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', me.subject))
      .unique()
    if (!meDoc) throw new Error('User not found')

    const isAdmin = meDoc.role === 'Administrator'

    const product = await ctx.db.get(args.id)
    if (!product) throw new Error('Product not found')

    if (!isAdmin && product.ownerUserId !== meDoc._id) {
      throw new Error('You cannot update this product')
    }

    const { id, ownerUserId: desiredOwner, ...fields } = args

    // Build the patch with only defined fields
    const patch: Record<string, unknown> = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined))

    if (desiredOwner !== undefined) {
      if (!isAdmin) throw new Error('Only administrators can change the ownerUserId')
      patch.ownerUserId = desiredOwner
    }

    if (Object.keys(patch).length === 0) return id // nothing to update

    await ctx.db.patch(id, patch)
    return id
  },
})

// DELETE: Remove a product
export const remove = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity()
    if (!me) throw new Error('Not authenticated')
    const meDoc = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', me.subject))
      .unique()
    if (!meDoc) throw new Error('User not found')

    const isAdmin = meDoc.role === 'Administrator'

    const product = await ctx.db.get(args.id)
    if (!product) throw new Error('Product not found')

    if (!isAdmin && product.ownerUserId !== meDoc._id) {
      throw new Error('You cannot delete this product')
    }

    await ctx.db.delete(args.id)
    return args.id
  },
})

// User: Make their product available/unavailable for a specific event
// This is effectively managed by admins adding products to event sales.
// This function allows a user to express intent or perhaps remove their product if it's not yet sold.
export const setProductAvailabilityForEvent = mutation({
  args: {
    available: v.boolean(), // true to make available, false to make unavailable
    eventId: v.id('events'),
    productId: v.id('products'),
    // salePrice: v.optional(v.number()), // User might suggest a price
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity()
    if (!me) throw new Error('Not authenticated')

    const meDoc = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', me.subject))
      .unique()
    if (!meDoc) throw new Error('User not found')

    const product = await ctx.db.get(args.productId)
    if (!product || product.ownerUserId !== meDoc._id) {
      throw new Error('Product not found or user does not own this product.')
    }

    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found.')
    }

    const existingEventProduct = await ctx.db
      .query('eventProducts')
      .withIndex('by_eventId_and_productId', (q) => q.eq('eventId', args.eventId).eq('productId', args.productId))
      .unique()

    if (args.available) {
      if (existingEventProduct) {
        if (existingEventProduct.status === ('Sold' as Status)) {
          throw new Error('Cannot make a sold product available again through this action.')
        }
        // User indicates willingness. If admin already added it and it's 'unavailable',
        // user's action won't change it back to 'on_sale'. Admin controls that.
        // If it's 'on_sale', no change needed.
        console.log(
          `User ${meDoc.nickname} expressed interest for product ${args.productId} in event ${args.eventId} to be available. Current status: ${existingEventProduct.status}`
        )
      } else {
        // User expresses interest. For now, we don't add to eventProducts.
        // Admin will explicitly add products to sale.
        console.log(
          `User ${meDoc.nickname} expressed interest for product ${args.productId} in event ${args.eventId} to be available. Product not currently in event sale list.`
        )
      }
    } else {
      // make unavailable
      if (existingEventProduct) {
        if (existingEventProduct.status === ('Sold' as Status)) {
          throw new Error('Cannot make a sold product unavailable.')
        }
        // Only patch if it's currently 'on_sale'. If 'unavailable', no change needed.
        if (existingEventProduct.status === ('On Sale' as Status)) {
          return await ctx.db.patch(existingEventProduct._id, {
            status: 'Reserved' as Status,
          })
        }
        console.log(
          `User ${meDoc.nickname} requested to make product ${args.productId} unavailable for event ${args.eventId}. Current status: ${existingEventProduct.status}`
        )
      }
      // If not in eventProducts, it's already effectively unavailable for that event.
    }
    return null
  },
})

// User: Choose to participate in an event
export const participateInEvent = mutation({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity()
    if (!me) throw new Error('Not authenticated')

    const meDoc = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', me.subject))
      .unique()
    if (!meDoc) throw new Error('User not found')
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found.')
    }

    const existingParticipant = await ctx.db
      .query('eventParticipants')
      .withIndex('by_eventId_and_userId', (q) => q.eq('eventId', args.eventId).eq('userId', meDoc._id))
      .unique()

    if (existingParticipant) {
      // If already a participant or organizer, do nothing or update role if allowed
      throw new Error('User is already an organizer for this event. Cannot change role to participant.')
    }

    return await ctx.db.insert('eventParticipants', {
      eventId: args.eventId,
      role: 'Guest' as Roles,
      userId: meDoc._id,
    })
  },
})

// Query: Get products available for a specific event (that are 'on_sale')
export const getProductsForEventSale = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, args) => {
    const eventProductsRaw = await ctx.db
      .query('eventProducts')
      .withIndex('by_eventId_and_status', (q) => q.eq('eventId', args.eventId).eq('status', 'On Sale'))
      .collect()

    return Promise.all(
      eventProductsRaw.map(async (ep) => {
        const product = await ctx.db.get(ep.productId)
        return {
          ...ep,
          originalPrice: product?.purchasePrice ?? 0,
          ownerId: product?.ownerUserId,
          productDescription: product?.description ?? '',
          productName: product?.productName ?? 'Unknown Product',
        }
      })
    )
  },
})

export const listMyProducts = query({
  args: {},
  handler: async (ctx) => {
    const me = await ctx.auth.getUserIdentity()
    if (!me) throw new Error('Not authenticated')

    const meDoc = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', me.subject))
      .unique()
    if (!meDoc) throw new Error('User not found')
    return await ctx.db
      .query('products')
      .withIndex('by_ownerId', (q) => q.eq('ownerUserId', meDoc._id))
      .order('desc')
      .collect()
  },
})
