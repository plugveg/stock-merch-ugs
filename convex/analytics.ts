import { query } from './_generated/server'
import { v } from 'convex/values'
import { Status } from './schema'

// Admin: Analytics for a specific event
export const getEventAnalytics = query({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity()
    if (!me) {
      throw new Error('User not authenticated')
    }

    const meDoc = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q) => q.eq('externalId', me.subject))
      .unique()
    if (!meDoc) throw new Error('User not found')

    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    // Verify user is an organizer or admin for this event
    const organizers = await ctx.db
      .query('eventParticipants')
      .withIndex('by_eventId_and_userId', (q) => q.eq('eventId', args.eventId).eq('userId', meDoc?._id))
      .filter((q) => q.eq(q.field('role'), 'organizer'))
      .collect()
    if (organizers.length === 0 && event.adminId !== meDoc._id) {
      throw new Error('Only event organizers or the event admin can view analytics.')
    }

    const eventProducts = await ctx.db
      .query('eventProducts')
      .withIndex('by_eventId', (q) => q.eq('eventId', args.eventId))
      .collect()

    let totalValueOnSale = 0
    let totalValueSold = 0
    let productsOnSaleCount = 0
    let productsSoldCount = 0

    for (const ep of eventProducts) {
      if (ep.status === ('On Sale' as Status)) {
        productsOnSaleCount++
        totalValueOnSale += ep.salePrice ?? 0
      } else if (ep.status === ('Sold' as Status)) {
        productsSoldCount++
        totalValueSold += ep.salePrice ?? 0
      }
    }

    const participants = await ctx.db
      .query('eventParticipants')
      .withIndex('by_eventId', (q) => q.eq('eventId', args.eventId))
      .collect()

    const participantDetails = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId)
        return {
          userId: p.userId,
          role: p.role,
          nickname: user?.nickname ?? user?.email ?? 'Unknown',
        }
      })
    )

    const timeRemaining = Math.max(0, event.endTime - Date.now()) // in milliseconds

    return {
      eventName: event.name,
      startTime: event.startTime,
      endTime: event.endTime,
      totalValueOnSale,
      totalValueSold,
      productsOnSaleCount,
      productsSoldCount,
      participantCount: participants.length,
      participants: participantDetails,
      timeRemaining, // ms
    }
  },
})
