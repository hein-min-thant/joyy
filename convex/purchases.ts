import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const hasPurchased = query({
    args: { userId: v.string(), comicId: v.id("comics") },
    handler: async (ctx, args) => {
        const purchase = await ctx.db
            .query("purchases")
            .withIndex("by_user_and_comic", (q) =>
                q.eq("userId", args.userId).eq("comicId", args.comicId)
            )
            .first();
        return purchase !== null;
    },
});

export const userPurchases = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const purchases = await ctx.db
            .query("purchases")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const comics = await Promise.all(
            purchases.map((p) => ctx.db.get(p.comicId))
        );

        return comics.filter((c) => c !== null);
    },
});

export const purchase = mutation({
    args: { userId: v.string(), comicId: v.id("comics") },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("purchases")
            .withIndex("by_user_and_comic", (q) =>
                q.eq("userId", args.userId).eq("comicId", args.comicId)
            )
            .first();

        if (existing) {
            throw new Error("Already purchased");
        }

        const comic = await ctx.db.get(args.comicId);
        if (!comic) {
            throw new Error("Comic not found");
        }

        if (comic.price > 0) {
            const wallet = await ctx.db
                .query("wallets")
                .withIndex("by_user", (q) => q.eq("userId", args.userId))
                .first();

            if (!wallet || wallet.coins < comic.price) {
                throw new Error("Insufficient coins");
            }

            await ctx.db.patch(wallet._id, {
                coins: wallet.coins - comic.price,
                updatedAt: Date.now(),
            });

            await ctx.db.insert("transactions", {
                userId: args.userId,
                type: "purchase",
                amount: -comic.price,
                description: `Purchased: ${comic.title}`,
                createdAt: Date.now(),
            });
        }

        // Update analytics
        const analytics = await ctx.db
            .query("analytics")
            .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
            .first();

        if (analytics) {
            await ctx.db.patch(analytics._id, {
                purchases: analytics.purchases + 1,
                revenue: analytics.revenue + comic.price,
                lastUpdated: Date.now(),
            });
        } else {
            await ctx.db.insert("analytics", {
                comicId: args.comicId,
                views: 0,
                purchases: 1,
                favorites: 0,
                averageRating: 0,
                revenue: comic.price,
                lastUpdated: Date.now(),
            });
        }

        return await ctx.db.insert("purchases", {
            userId: args.userId,
            comicId: args.comicId,
            purchasedAt: Date.now(),
        });
    },
});
