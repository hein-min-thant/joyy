import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("coinPackages")
            .filter((q) => q.eq(q.field("active"), true))
            .collect();
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        coins: v.number(),
        price: v.number(),
        bonus: v.number(),
        popular: v.boolean(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("coinPackages", {
            ...args,
            active: true,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("coinPackages"),
        name: v.optional(v.string()),
        coins: v.optional(v.number()),
        price: v.optional(v.number()),
        bonus: v.optional(v.number()),
        popular: v.optional(v.boolean()),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const filteredUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );
        await ctx.db.patch(id, filteredUpdates);
    },
});
