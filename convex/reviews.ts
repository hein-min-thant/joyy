import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
    args: {
        userId: v.string(),
        comicId: v.id("comics"),
        rating: v.number(),
        comment: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("reviews")
            .withIndex("by_user_and_comic", (q) =>
                q.eq("userId", args.userId).eq("comicId", args.comicId)
            )
            .first();

        const now = Date.now();

        if (existing) {
            await ctx.db.patch(existing._id, {
                rating: args.rating,
                comment: args.comment,
                updatedAt: now,
            });
        } else {
            await ctx.db.insert("reviews", {
                ...args,
                createdAt: now,
                updatedAt: now,
            });
        }

        // Update analytics with new average rating
        const allReviews = await ctx.db
            .query("reviews")
            .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
            .collect();

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        const analytics = await ctx.db
            .query("analytics")
            .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
            .first();

        if (analytics) {
            await ctx.db.patch(analytics._id, {
                averageRating: avgRating,
                lastUpdated: Date.now(),
            });
        } else {
            await ctx.db.insert("analytics", {
                comicId: args.comicId,
                views: 0,
                purchases: 0,
                favorites: 0,
                averageRating: avgRating,
                revenue: 0,
                lastUpdated: Date.now(),
            });
        }

        return existing?._id;
    },
});

export const getComicReviews = query({
    args: { comicId: v.id("comics") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("reviews")
            .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
            .order("desc")
            .collect();
    },
});

export const getUserReview = query({
    args: { userId: v.string(), comicId: v.id("comics") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("reviews")
            .withIndex("by_user_and_comic", (q) =>
                q.eq("userId", args.userId).eq("comicId", args.comicId)
            )
            .first();
    },
});

export const getAverageRating = query({
    args: { comicId: v.id("comics") },
    handler: async (ctx, args) => {
        const reviews = await ctx.db
            .query("reviews")
            .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
            .collect();

        if (reviews.length === 0) return { average: 0, count: 0 };

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return {
            average: sum / reviews.length,
            count: reviews.length,
        };
    },
});
