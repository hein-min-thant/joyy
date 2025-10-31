import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Check if a username is reserved
export const isReserved = query({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        const reserved = await ctx.db
            .query("reservedUsernames")
            .withIndex("by_username", (q) => q.eq("username", args.username.toLowerCase()))
            .first();
        return !!reserved;
    },
});

// List all reserved usernames (admin only)
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("reservedUsernames")
            .order("desc")
            .collect();
    },
});

// Add a reserved username (admin only)
export const add = mutation({
    args: {
        username: v.string(),
        adminUserId: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if admin
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_user", (q) => q.eq("userId", args.adminUserId))
            .first();

        if (!admin) {
            throw new Error("Unauthorized: Admin access required");
        }

        // Check if already reserved
        const existing = await ctx.db
            .query("reservedUsernames")
            .withIndex("by_username", (q) => q.eq("username", args.username.toLowerCase()))
            .first();

        if (existing) {
            throw new Error("Username already reserved");
        }

        return await ctx.db.insert("reservedUsernames", {
            username: args.username.toLowerCase(),
            createdAt: Date.now(),
            createdBy: args.adminUserId,
        });
    },
});

// Remove a reserved username (admin only)
export const remove = mutation({
    args: {
        id: v.id("reservedUsernames"),
        adminUserId: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if admin
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_user", (q) => q.eq("userId", args.adminUserId))
            .first();

        if (!admin) {
            throw new Error("Unauthorized: Admin access required");
        }

        await ctx.db.delete(args.id);
    },
});
