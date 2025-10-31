import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new chapter
export const create = mutation({
    args: {
        comicId: v.id("comics"),
        chapterNumber: v.number(),
        title: v.string(),
        price: v.number(), // 0 for free chapters
    },
    handler: async (ctx, args) => {
        const chapterId = await ctx.db.insert("chapters", {
            comicId: args.comicId,
            chapterNumber: args.chapterNumber,
            title: args.title,
            price: args.price,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        return chapterId;
    },
});

// Get all chapters for a comic
export const listByComic = query({
    args: { comicId: v.id("comics") },
    handler: async (ctx, args) => {
        const chapters = await ctx.db
            .query("chapters")
            .withIndex("by_comic", (q) => q.eq("comicId", args.comicId))
            .order("asc")
            .collect();
        return chapters;
    },
});

// Get a specific chapter
export const get = query({
    args: { id: v.id("chapters") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Update chapter
export const update = mutation({
    args: {
        id: v.id("chapters"),
        chapterNumber: v.optional(v.number()),
        title: v.optional(v.string()),
        price: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now(),
        });
    },
});

// Delete chapter
export const remove = mutation({
    args: { id: v.id("chapters") },
    handler: async (ctx, args) => {
        // Delete all pages in this chapter
        const pages = await ctx.db
            .query("pages")
            .withIndex("by_chapter", (q) => q.eq("chapterId", args.id))
            .collect();

        for (const page of pages) {
            await ctx.db.delete(page._id);
        }

        await ctx.db.delete(args.id);
    },
});
