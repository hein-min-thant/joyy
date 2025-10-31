import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggle = mutation({
    args: { userId: v.string(), comicId: v.id("comics") },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("favorites")
            .withIndex("by_user_and_comic", (q) =>
                q.eq("userId", args.userId).eq("comicId", args.comicId)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);

            // Update analytics
            const analytics = await ctx.db
                .query("analytics")
                .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
                .first();
            if (analytics && analytics.favorites > 0) {
                await ctx.db.patch(analytics._id, {
                    favorites: analytics.favorites - 1,
                    lastUpdated: Date.now(),
                });
            }

            return { favorited: false };
        }

        await ctx.db.insert("favorites", {
            userId: args.userId,
            comicId: args.comicId,
            createdAt: Date.now(),
        });

        // Update analytics
        const analytics = await ctx.db
            .query("analytics")
            .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
            .first();
        if (analytics) {
            await ctx.db.patch(analytics._id, {
                favorites: analytics.favorites + 1,
                lastUpdated: Date.now(),
            });
        } else {
            await ctx.db.insert("analytics", {
                comicId: args.comicId,
                views: 0,
                purchases: 0,
                favorites: 1,
                averageRating: 0,
                revenue: 0,
                lastUpdated: Date.now(),
            });
        }

        return { favorited: true };
    },
});

export const isFavorited = query({
    args: { userId: v.string(), comicId: v.id("comics") },
    handler: async (ctx, args) => {
        const favorite = await ctx.db
            .query("favorites")
            .withIndex("by_user_and_comic", (q) =>
                q.eq("userId", args.userId).eq("comicId", args.comicId)
            )
            .first();
        return favorite !== null;
    },
});

export const getUserFavorites = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const favorites = await ctx.db
            .query("favorites")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();

        const comics = await Promise.all(
            favorites.map((f) => ctx.db.get(f.comicId))
        );

        return comics.filter((c) => c !== null);
    },
});

export const getComicFavoriteCount = query({
    args: { comicId: v.id("comics") },
    handler: async (ctx, args) => {
        const favorites = await ctx.db
            .query("favorites")
            .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
            .collect();
        return favorites.length;
    },
});
