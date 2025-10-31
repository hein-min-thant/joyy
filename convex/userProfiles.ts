import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("userProfiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();
    },
});

export const create = mutation({
    args: {
        userId: v.string(),
        displayName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("userProfiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (existing) {
            return existing;
        }

        const id = await ctx.db.insert("userProfiles", {
            userId: args.userId,
            displayName: args.displayName || "User",
            bio: "",
            badges: [],
            totalRead: 0,
            totalReviews: 0,
            memberSince: Date.now(),
            isPublic: true,
            theme: "light",
        });

        return await ctx.db.get(id);
    },
});

export const update = mutation({
    args: {
        userId: v.string(),
        displayName: v.optional(v.string()),
        bio: v.optional(v.string()),
        avatar: v.optional(v.string()),
        isPublic: v.optional(v.boolean()),
        theme: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        const { userId, ...updates } = args;
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        if (profile) {
            await ctx.db.patch(profile._id, filteredUpdates);
            return await ctx.db.get(profile._id);
        }

        return null;
    },
});

export const incrementRead = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (profile) {
            await ctx.db.patch(profile._id, {
                totalRead: profile.totalRead + 1,
            });
        }
    },
});

export const incrementReviews = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (profile) {
            await ctx.db.patch(profile._id, {
                totalReviews: profile.totalReviews + 1,
            });
        }
    },
});
