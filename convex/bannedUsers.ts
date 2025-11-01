import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Check if a user is banned or suspended
export const checkUserStatus = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const ban = await ctx.db
            .query("bannedUsers")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        if (!ban) {
            return { isBanned: false, type: null, reason: null };
        }

        // Check if suspension has expired
        if (ban.type === "suspend" && ban.expiresAt && ban.expiresAt < Date.now()) {
            // Suspension has expired, return as not banned
            // Note: We can't patch in a query, so we just return the status
            return { isBanned: false, type: null, reason: null };
        }

        return {
            isBanned: true,
            type: ban.type,
            reason: ban.reason,
            expiresAt: ban.expiresAt,
        };
    },
});

// List all banned/suspended users (admin only)
export const list = query({
    args: { includeInactive: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        if (!args.includeInactive) {
            return await ctx.db
                .query("bannedUsers")
                .withIndex("by_active", (q) => q.eq("isActive", true))
                .order("desc")
                .collect();
        }

        return await ctx.db
            .query("bannedUsers")
            .order("desc")
            .collect();
    },
});

// Ban a user permanently (admin only)
export const banUser = mutation({
    args: {
        identifier: v.string(), // Can be userId or username
        reason: v.string(),
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

        // Try to find user by username first
        let userId = args.identifier;
        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_username", (q) => q.eq("username", args.identifier.toLowerCase()))
            .first();

        if (wallet) {
            userId = wallet.userId;
        }

        // Check if user is already banned
        const existing = await ctx.db
            .query("bannedUsers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        if (existing) {
            throw new Error("User is already banned or suspended");
        }

        return await ctx.db.insert("bannedUsers", {
            userId: userId,
            reason: args.reason,
            type: "ban",
            bannedBy: args.adminUserId,
            bannedAt: Date.now(),
            isActive: true,
        });
    },
});

// Suspend a user temporarily (admin only)
export const suspendUser = mutation({
    args: {
        identifier: v.string(), // Can be userId or username
        reason: v.string(),
        days: v.number(), // Number of days to suspend
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

        // Try to find user by username first
        let userId = args.identifier;
        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_username", (q) => q.eq("username", args.identifier.toLowerCase()))
            .first();

        if (wallet) {
            userId = wallet.userId;
        }

        // Check if user is already banned/suspended
        const existing = await ctx.db
            .query("bannedUsers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        if (existing) {
            throw new Error("User is already banned or suspended");
        }

        const expiresAt = Date.now() + args.days * 24 * 60 * 60 * 1000;

        return await ctx.db.insert("bannedUsers", {
            userId: userId,
            reason: args.reason,
            type: "suspend",
            bannedBy: args.adminUserId,
            bannedAt: Date.now(),
            expiresAt,
            isActive: true,
        });
    },
});

// Unban/unsuspend a user (admin only)
export const unbanUser = mutation({
    args: {
        banId: v.id("bannedUsers"),
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

        await ctx.db.patch(args.banId, { isActive: false });
    },
});
