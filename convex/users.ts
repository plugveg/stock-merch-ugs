/* eslint-disable no-console */
import { UserJSON } from '@clerk/backend'
import { v, Validator } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'

import { Roles } from './schema'
import { internalMutation, query, QueryCtx } from './_generated/server'

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx)
  },
})

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    // Convertit null → undefined et cast le role
    const userAttributes = {
      email: data.email_addresses[0].email_address, // obligatoire
      externalId: data.id,
      firstName: data.first_name ?? undefined,
      imageUrl: data.image_url,
      lastName: data.last_name ?? undefined,
      nickname: data.username ?? undefined,
      phoneNumber: data.phone_numbers[0]?.phone_number ?? undefined,
      // Si public_metadata.role n'est pas dans UserRole, on retombe sur "Guest"
      role: (data.public_metadata?.role as Roles) ?? 'Guest',
    }

    const user = await userByExternalId(ctx, data.id)
    if (user === null) {
      await ctx.db.insert('users', userAttributes)
    } else {
      await ctx.db.patch(user._id, userAttributes)
    }
  },
})

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId)

    if (user !== null) {
      await ctx.db.delete(user._id)
    } else {
      console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`)
    }
  },
})

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx)
  if (!userRecord) throw new Error("Can't get current user")
  return userRecord
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (identity === null) {
    return null
  }
  return await userByExternalId(ctx, identity.subject)
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query('users')
    .withIndex('byExternalId', (q) => q.eq('externalId', externalId))
    .unique()
}

export const listUsersLite = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const results = await ctx.db.query('users').order('asc').paginate(args.paginationOpts)

    // Transform only the page property, keep pagination metadata
    return {
      ...results,
      page: results.page.map(({ _id, email, nickname }) => ({
        _id,
        label: nickname ?? email,
      })),
    }
  },
})

export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    // Optional: Add an admin check here if not all authenticated users should list all other users.
    // const userId = await getAuthUserId(ctx);
    // if (!userId) throw new Error("Not authenticated");
    // const adminUser = await ctx.db.get(userId);
    // if(!adminUser || !adminUser.isAdminProperty) throw new Error("Not an admin");

    const users = await ctx.db.query('users').collect()
    return users.map((user) => ({
      _id: user._id,
      email: user.email,
      nickname: user.nickname,
    }))
  },
})
