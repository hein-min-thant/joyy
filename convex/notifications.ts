import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
    args: {
        userId: v.string(),
        type: v.string(),
        title: v.string(),
        message: v.string(),
        link: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("notifications", {
            ...args,
            read: false,
            createdAt: Date.now(),
        });
    },
});

export const getUserNotifications = query({
    args: { userId: v.string(), limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(args.limit || 20);
    },
});

export const getUnreadCount = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_and_read", (q) =>
                q.eq("userId", args.userId).eq("read", false)
            )
            .collect();
        return unread.length;
    },
});

export const markAsRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.notificationId, { read: true });
    },
});

export const markAllAsRead = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_user_and_read", (q) =>
                q.eq("userId", args.userId).eq("read", false)
            )
            .collect();

        await Promise.all(
            unread.map((n) => ctx.db.patch(n._id, { read: true }))
        );
    },
});
