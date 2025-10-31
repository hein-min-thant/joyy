import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Check if user has purchased a specific chapter
export const hasPurchased = query({
    args: {
        userId: v.string(),
        chapterId: v.id("chapters"),
    },
    handler: async (ctx, args) => {
        const purchase = await ctx.db
            .query("chapterPurchases")
            .withIndex("by_user_and_chapter", (q) =>
                q.eq("userId", args.userId).eq("chapterId", args.chapterId)
            )
            .first();
        return purchase !== null;
    },
});

// Purchase a chapter
export const purchase = mutation({
    args: {
        userId: v.string(),
        chapterId: v.id("chapters"),
    },
    handler: async (ctx, args) => {
        // Check if already purchased
        const existing = await ctx.db
            .query("chapterPurchases")
            .withIndex("by_user_and_chapter", (q) =>
                q.eq("userId", args.userId).eq("chapterId", args.chapterId)
            )
            .first();

        if (existing) {
            throw new Error("Chapter already purchased");
        }

        // Get chapter details
        const chapter = await ctx.db.get(args.chapterId);
        if (!chapter) {
            throw new Error("Chapter not found");
        }

        // Check if user has purchased the full comic
        const comicPurchase = await ctx.db
            .query("purchases")
            .withIndex("by_user_and_comic", (q) =>
                q.eq("userId", args.userId).eq("comicId", chapter.comicId)
            )
            .first();

        if (comicPurchase) {
            throw new Error("You already own the full comic");
        }

        // Get user wallet
        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (!wallet) {
            throw new Error("Wallet not found");
        }

        if (wallet.coins < chapter.price) {
            throw new Error("Insufficient coins");
        }

        // Deduct coins
        await ctx.db.patch(wallet._id, {
            coins: wallet.coins - chapter.price,
            updatedAt: Date.now(),
        });

        // Create purchase record
        await ctx.db.insert("chapterPurchases", {
            userId: args.userId,
            chapterId: args.chapterId,
            purchasedAt: Date.now(),
        });

        // Create transaction record
        await ctx.db.insert("transactions", {
            userId: args.userId,
            type: "purchase",
            amount: -chapter.price,
            description: `Purchased chapter: ${chapter.title}`,
            createdAt: Date.now(),
        });

        return { success: true };
    },
});

// Get user's purchased chapters
export const userPurchases = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const purchases = await ctx.db
            .query("chapterPurchases")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const chapters = await Promise.all(
            purchases.map(async (purchase) => {
                const chapter = await ctx.db.get(purchase.chapterId);
                return chapter;
            })
        );

        return chapters.filter((c) => c !== null);
    },
});
