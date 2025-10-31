import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getComicAnalytics = query({
    args: { comicId: v.id("comics") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("analytics")
            .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
            .first();
    },
});

export const incrementViews = mutation({
    args: { comicId: v.id("comics") },
    handler: async (ctx, args) => {
        const analytics = await ctx.db
            .query("analytics")
            .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
            .first();

        if (analytics) {
            await ctx.db.patch(analytics._id, {
                views: analytics.views + 1,
                lastUpdated: Date.now(),
            });
        } else {
            await ctx.db.insert("analytics", {
                comicId: args.comicId,
                views: 1,
                purchases: 0,
                favorites: 0,
                averageRating: 0,
                revenue: 0,
                lastUpdated: Date.now(),
            });
        }
    },
});

export const getTopComics = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const analytics = await ctx.db.query("analytics").collect();
        const sorted = analytics.sort((a, b) => b.purchases - a.purchases);
        const top = sorted.slice(0, args.limit || 10);

        const comics = await Promise.all(
            top.map(async (a) => {
                const comic = await ctx.db.get(a.comicId);
                return comic ? { ...comic, analytics: a } : null;
            })
        );

        return comics.filter((c) => c !== null);
    },
});

export const getTotalRevenue = query({
    handler: async (ctx) => {
        const analytics = await ctx.db.query("analytics").collect();
        return analytics.reduce((sum, a) => sum + a.revenue, 0);
    },
});
