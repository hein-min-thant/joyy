import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: { chapterId: v.id("chapters") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("pages")
            .withIndex("by_chapter", (q) => q.eq("chapterId", args.chapterId))
            .order("asc")
            .collect();
    },
});

// Legacy query for old pages that use comicId instead of chapterId
export const listByComic = query({
    args: { comicId: v.id("comics") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("pages")
            .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
            .order("asc")
            .collect();
    },
});

export const add = mutation({
    args: {
        chapterId: v.id("chapters"),
        pageNumber: v.number(),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("pages", args);
    },
});

export const remove = mutation({
    args: { id: v.id("pages") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
