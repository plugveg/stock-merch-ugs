/* eslint-disable no-console */
import type { WebhookEvent } from '@clerk/backend'

import { Webhook } from 'svix'
import { httpRouter } from 'convex/server'

import { internal } from './_generated/api'
import { httpAction } from './_generated/server'

const http = httpRouter()

http.route({
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request)
    if (!event) {
      return new Response('Error occurred', { status: 400 })
    }
    switch (event.type) {
      case 'user.created': // intentional fallthrough
      case 'user.updated':
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        })
        break

      case 'user.deleted': {
        if (!event.data.id) {
          console.error("Missing 'id' in event.data for user.deleted event")
          return new Response('Invalid event data', { status: 400 })
        }
        const clerkUserId = event.data.id
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkUserId,
        })
        break
      }
      default:
        console.log('Ignored Clerk webhook event', event.type)
    }

    return new Response(null, { status: 200 })
  }),
  method: 'POST',
  path: '/clerk-users-webhook',
})

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text()
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing required Svix headers')
    return null
  }

  const svixHeaders = {
    'svix-id': svixId,
    'svix-signature': svixSignature,
    'svix-timestamp': svixTimestamp,
  }
  const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!clerkWebhookSecret) {
    throw new Error('Environment variable CLERK_WEBHOOK_SECRET is not set.')
  }
  const wh = new Webhook(clerkWebhookSecret)
  try {
    const verifiedPayload = wh.verify(payloadString, svixHeaders)
    if (isValidWebhookEvent(verifiedPayload)) {
      return verifiedPayload
    } else {
      console.error('Invalid webhook event structure', verifiedPayload)
      return null
    }
  } catch (error) {
    console.error('Error verifying webhook event:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

function isValidWebhookEvent(payload: unknown): payload is WebhookEvent {
  if (typeof payload !== 'object' || payload === null) {
    return false
  }
  const p = payload as Record<string, unknown>
  return typeof p.type === 'string' && typeof p.data === 'object' && p.data !== null
}

export default http
