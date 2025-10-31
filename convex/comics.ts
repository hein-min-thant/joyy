import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: { category: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (args.category) {
            const category = args.category;
            return await ctx.db
                .query("comics")
                .withIndex("by_category", (q) => q.eq("category", category))
                .order("desc")
                .collect();
        }
        return await ctx.db.query("comics").order("desc").collect();
    },
});

export const search = query({
    args: {
        query: v.string(),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (args.category) {
            const category = args.category;
            return await ctx.db
                .query("comics")
                .withSearchIndex("search_title", (q) =>
                    q.search("title", args.query).eq("category", category)
                )
                .collect();
        }
        return await ctx.db
            .query("comics")
            .withSearchIndex("search_title", (q) => q.search("title", args.query))
            .collect();
    },
});

export const get = query({
    args: { id: v.id("comics") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        coverImage: v.string(),
        price: v.number(),
        author: v.string(),
        genre: v.array(v.string()),
        category: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("comics", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("comics"),
        title: v.string(),
        description: v.string(),
        coverImage: v.string(),
        price: v.number(),
        author: v.string(),
        genre: v.array(v.string()),
        category: v.string(),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: { id: v.id("comics") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
