import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateProgress = mutation({
    args: {
        userId: v.string(),
        comicId: v.id("comics"),
        chapterId: v.id("chapters"),
        currentPage: v.number(),
        totalPages: v.number(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("readingProgress")
            .withIndex("by_user_and_chapter", (q) =>
                q.eq("userId", args.userId).eq("chapterId", args.chapterId)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                currentPage: args.currentPage,
                totalPages: args.totalPages,
                lastReadAt: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("readingProgress", {
            ...args,
            lastReadAt: Date.now(),
        });
    },
});

export const getProgress = query({
    args: { userId: v.string(), comicId: v.id("comics") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("readingProgress")
            .withIndex("by_user_and_comic", (q) =>
                q.eq("userId", args.userId).eq("comicId", args.comicId)
            )
            .first();
    },
});

export const getContinueReading = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const progress = await ctx.db
            .query("readingProgress")
            .withIndex("by_last_read", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(5);

        const comics = await Promise.all(
            progress.map(async (p) => {
                const comic = await ctx.db.get(p.comicId);
                return comic ? { ...comic, progress: p } : null;
            })
        );

        return comics.filter((c) => c !== null);
    },
});
