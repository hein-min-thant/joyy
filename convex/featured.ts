import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    handler: async (ctx) => {
        const now = Date.now();
        const featured = await ctx.db
            .query("featured")
            .withIndex("by_active", (q) => q.eq("active", true))
            .collect();

        const active = featured.filter(
            (f) => f.startDate <= now && (!f.endDate || f.endDate >= now)
        );

        const comics = await Promise.all(
            active
                .sort((a, b) => b.priority - a.priority)
                .map((f) => ctx.db.get(f.comicId))
        );

        return comics.filter((c) => c !== null);
    },
});

export const add = mutation({
    args: {
        comicId: v.id("comics"),
        priority: v.number(),
        startDate: v.number(),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("featured", {
            ...args,
            active: true,
        });
    },
});

export const remove = mutation({
    args: { id: v.id("featured") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { active: false });
    },
});
