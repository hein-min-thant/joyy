import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addToHistory = mutation({
    args: { userId: v.string(), comicId: v.id("comics") },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("readingHistory")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("comicId"), args.comicId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                lastReadAt: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("readingHistory", {
            userId: args.userId,
            comicId: args.comicId,
            lastReadAt: Date.now(),
        });
    },
});

export const getRecentlyRead = query({
    args: { userId: v.string(), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const history = await ctx.db
            .query("readingHistory")
            .withIndex("by_user_and_time", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(args.limit || 10);

        const comics = await Promise.all(
            history.map(async (h) => {
                const comic = await ctx.db.get(h.comicId);
                return comic ? { ...comic, lastReadAt: h.lastReadAt } : null;
            })
        );

        return comics.filter((c) => c !== null);
    },
});
