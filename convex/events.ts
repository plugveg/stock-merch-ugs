import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { roles, Roles, status, Status } from "./schema";

// Admin: Create a new event
export const createEvent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) {
      throw new Error("User not authenticated");
    }

    const meDoc = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", me.subject))
      .unique();
    if (!meDoc) throw new Error("User not found");

    const eventId = await ctx.db.insert("events", {
      name: args.name,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location || "A déterminer", // Default location if not provided
      adminId: meDoc._id,
    });

    // Automatically add the creator as an organizer
    await ctx.db.insert("eventParticipants", {
      eventId: eventId,
      userId: meDoc._id,
      role: "Board of directors" as Roles,
    });

    return eventId;
  },
});

// Admin: Add a user to an event (as organizer or participant)
export const addUserToEvent = mutation({
  args: {
    eventId: v.id("events"),
    emailToAdd: v.string(), // Add user by email
    role: v.union(roles),
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) {
      throw new Error("User not authenticated");
    }

    const meDoc = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", me.subject))
      .unique();
    if (!meDoc) throw new Error("User not found");

    const event = await ctx.db.get(args.eventId);
    if (!event || event.adminId !== meDoc._id) {
      // Basic check: only event admin can add users.
      // More robust: check if adminUserId is an organizer for this event.
      const organizers = await ctx.db
        .query("eventParticipants")
        .withIndex("by_eventId_and_userId", (q) =>
          q.eq("eventId", args.eventId).eq("userId", meDoc._id),
        )
        .filter((q) =>
          q.or(
            q.eq(q.field("role"), "Administrator"),
            q.eq(q.field("role"), "Board of directors"),
          ),
        )
        .collect();
      if (organizers.length === 0) {
        throw new Error("Only event organizers can add users to the event.");
      }
    }

    const userToAdd = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.emailToAdd))
      .unique();

    if (!userToAdd) {
      throw new Error(`User with email ${args.emailToAdd} not found.`);
    }

    const existingParticipant = await ctx.db
      .query("eventParticipants")
      .withIndex("by_eventId_and_userId", (q) =>
        q.eq("eventId", args.eventId).eq("userId", userToAdd._id),
      )
      .unique();

    if (existingParticipant) {
      // Optionally update role or throw error
      // For now, let's prevent duplicates
      throw new Error("User is already part of this event.");
    }

    return await ctx.db.insert("eventParticipants", {
      eventId: args.eventId,
      userId: userToAdd._id,
      role: args.role as Roles,
    });
  },
});

// Admin or User: Remove a user from an event
export const removeUserFromEvent = mutation({
  args: {
    eventId: v.id("events"),
    userIdToRemove: v.id("users"),
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) {
      throw new Error("User not authenticated");
    }

    const meDoc = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", me.subject))
      .unique();
    if (!meDoc) throw new Error("User not found");

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check permissions:
    // 1. Is the calling user the one being removed? (User removing themselves)
    // 2. Is the calling user an organizer of the event?
    // 3. Is the calling user the admin of the event?
    let canRemove = false;
    if (meDoc._id === args.userIdToRemove) {
      canRemove = true;
    } else {
      const organizers = await ctx.db
        .query("eventParticipants")
        .withIndex("by_eventId_and_userId", (q) =>
          q.eq("eventId", args.eventId).eq("userId", meDoc._id),
        )
        .filter((q) =>
          q.or(
            q.eq(q.field("role"), "Administrator"),
            q.eq(q.field("role"), "Board of directors"),
          ),
        )
        .collect();
      if (organizers.length > 0 || event.adminId === meDoc._id) {
        canRemove = true;
      }
    }

    if (!canRemove) {
      throw new Error(
        "You do not have permission to remove this user from the event.",
      );
    }

    // Prevent admin/original creator from being removed by others if they are the last organizer or admin
    if (args.userIdToRemove === event.adminId) {
      const otherOrganizers = await ctx.db
        .query("eventParticipants")
        .withIndex("by_eventId_and_role", (q) =>
          q.eq("eventId", args.eventId).eq("role", "Administrator"),
        )
        .filter((q) => q.neq(q.field("userId"), args.userIdToRemove))
        .collect();
      if (otherOrganizers.length === 0) {
        throw new Error("Cannot remove the last organizer/admin of the event.");
      }
    }

    const participantEntry = await ctx.db
      .query("eventParticipants")
      .withIndex("by_eventId_and_userId", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userIdToRemove),
      )
      .unique();

    if (!participantEntry) {
      throw new Error("User is not part of this event or already removed.");
    }

    await ctx.db.delete(participantEntry._id);
    return { success: true };
  },
});

// Admin: Add a product to an event for sale
export const addProductToEventSale = mutation({
  args: {
    eventId: v.id("events"),
    productId: v.id("products"),
    salePrice: v.number(),
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) {
      throw new Error("User not authenticated");
    }

    const meDoc = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", me.subject))
      .unique();
    if (!meDoc) throw new Error("User not found");
    // TODO: Add check to ensure user is an admin/organizer for the event
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const organizers = await ctx.db
      .query("eventParticipants")
      .withIndex("by_eventId_and_userId", (q) =>
        q.eq("eventId", args.eventId).eq("userId", meDoc._id),
      )
      .filter((q) => q.eq(q.field("role"), "organizer"))
      .collect();
    if (organizers.length === 0 && event.adminId !== meDoc._id) {
      throw new Error(
        "Only event organizers can add products to the event sale.",
      );
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if product is already in the event
    const existingEventProduct = await ctx.db
      .query("eventProducts")
      .withIndex("by_eventId_and_productId", (q) =>
        q.eq("eventId", args.eventId).eq("productId", args.productId),
      )
      .unique();

    if (existingEventProduct) {
      // If it exists, update it (e.g. price or status)
      return await ctx.db.patch(existingEventProduct._id, {
        status: "On Sale" as Status,
        salePrice: args.salePrice,
      });
    } else {
      // If not, insert new
      return await ctx.db.insert("eventProducts", {
        eventId: args.eventId,
        productId: args.productId,
        status: "On Sale" as Status,
        salePrice: args.salePrice,
      });
    }
  },
});

// Admin: Update product status in an event (e.g., mark as sold)
export const updateEventProductStatus = mutation({
  args: {
    eventProductId: v.id("eventProducts"),
    status: status,
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) {
      throw new Error("User not authenticated");
    }

    const meDoc = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", me.subject))
      .unique();
    if (!meDoc) throw new Error("User not found");
    // TODO: Add check to ensure user is an admin/organizer for the event associated with eventProduct
    const eventProduct = await ctx.db.get(args.eventProductId);
    if (!eventProduct) throw new Error("Event product not found");

    const event = await ctx.db.get(eventProduct.eventId);
    if (!event) throw new Error("Event not found");

    const organizers = await ctx.db
      .query("eventParticipants")
      .withIndex("by_eventId_and_userId", (q) =>
        q.eq("eventId", eventProduct.eventId).eq("userId", meDoc._id),
      )
      .filter((q) => q.eq(q.field("role"), "organizer"))
      .collect();
    if (organizers.length === 0 && event.adminId !== meDoc._id) {
      throw new Error("Only event organizers can update product status.");
    }

    return await ctx.db.patch(args.eventProductId, {
      status: args.status as Status,
    });
  },
});

// Query: Get all events (could be paginated later)
export const listEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").order("desc").collect();
  },
});

// Query: Get details for a specific event, including participants and products
export const getEventDetails = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      return null;
    }

    const participants = await ctx.db
      .query("eventParticipants")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const participantDetails = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          ...p,
          userName: user?.nickname ?? user?.email ?? "Unknown User",
        };
      }),
    );

    const eventProductsRaw = await ctx.db
      .query("eventProducts")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const eventProducts = await Promise.all(
      eventProductsRaw.map(async (ep) => {
        const product = await ctx.db.get(ep.productId);
        // const imageUrl = product?.imageStorageId ? await ctx.storage.getUrl(product.imageStorageId) : null;
        return {
          ...ep,
          productName: product?.productName ?? "Unknown Product",
          productDescription: product?.description ?? "",
          originalPrice: product?.purchasePrice ?? 0,
          // imageUrl,
        };
      }),
    );

    return {
      ...event,
      participants: participantDetails,
      products: eventProducts,
    };
  },
});

// Query: Get events a user is organizing or participating in
export const getMyEvents = query({
  args: {},
  handler: async (ctx) => {
    // const userId = await getAuthUserId(ctx);
    // if (!userId) {
    //   return [];
    // }

    const me = await ctx.auth.getUserIdentity();
    if (!me) {
      throw new Error("User not authenticated");
    }

    const meDoc = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", me.subject))
      .unique();
    if (!meDoc) throw new Error("User not found");

    const participations = await ctx.db
      .query("eventParticipants")
      .withIndex("by_userId", (q) => q.eq("userId", meDoc._id))
      .collect();

    const eventIds = participations.map((p) => p.eventId);
    if (eventIds.length === 0) return [];

    const events = await Promise.all(eventIds.map((id) => ctx.db.get(id)));
    return events
      .filter((e) => e !== null)
      .map((e) => ({
        ...e!,
        role: participations.find((p) => p.eventId === e!._id)?.role,
      }));
  },
});

// Admin: Remove a product from an event's sale list
export const removeProductFromEventSale = mutation({
  args: {
    eventProductId: v.id("eventProducts"),
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) {
      throw new Error("User not authenticated");
    }

    const meDoc = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", me.subject))
      .unique();
    if (!meDoc) throw new Error("User not found");

    const eventProduct = await ctx.db.get(args.eventProductId);
    if (!eventProduct) {
      throw new Error("Event product not found.");
    }

    const event = await ctx.db.get(eventProduct.eventId);
    if (!event) {
      throw new Error("Associated event not found.");
    }

    // Check if the user is an organizer for the event or the event admin
    const organizers = await ctx.db
      .query("eventParticipants")
      .withIndex("by_eventId_and_userId", (q) =>
        q.eq("eventId", eventProduct.eventId).eq("userId", meDoc._id),
      )
      .filter((q) => q.eq(q.field("role"), "organizer"))
      .collect();

    if (organizers.length === 0 && event.adminId !== meDoc._id) {
      throw new Error(
        "Only event organizers or the event admin can remove products from the event sale.",
      );
    }

    await ctx.db.delete(args.eventProductId);
    return { success: true };
  },
});
