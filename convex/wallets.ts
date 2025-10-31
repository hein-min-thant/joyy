import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getBalance = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();
        return wallet?.coins ?? 0;
    },
});

export const getOrCreateWallet = mutation({
    args: { userId: v.string(), username: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("wallets")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (existing) {
            return existing;
        }

        const walletId = await ctx.db.insert("wallets", {
            userId: args.userId,
            username: args.username || args.userId,
            coins: 0,
            updatedAt: Date.now(),
        });

        return await ctx.db.get(walletId);
    },
});

export const getUserByUsername = query({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("wallets")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();
    },
});

export const setUsername = mutation({
    args: { userId: v.string(), username: v.string() },
    handler: async (ctx, args) => {
        // Check if username is already taken
        const existing = await ctx.db
            .query("wallets")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();

        if (existing && existing.userId !== args.userId) {
            throw new Error("Username already taken");
        }

        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (!wallet) {
            // Create wallet with username
            const walletId = await ctx.db.insert("wallets", {
                userId: args.userId,
                username: args.username,
                coins: 0,
                updatedAt: Date.now(),
            });
            return await ctx.db.get(walletId);
        }

        await ctx.db.patch(wallet._id, {
            username: args.username,
            updatedAt: Date.now(),
        });

        return await ctx.db.get(wallet._id);
    },
});

export const getUsername = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();
        return wallet?.username || null;
    },
});

export const topup = mutation({
    args: {
        identifier: v.string(), // Can be userId or username
        amount: v.number(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        // Try to find by username first
        let wallet = await ctx.db
            .query("wallets")
            .withIndex("by_username", (q) => q.eq("username", args.identifier))
            .first();

        // If not found, try by userId
        if (!wallet) {
            wallet = await ctx.db
                .query("wallets")
                .withIndex("by_user", (q) => q.eq("userId", args.identifier))
                .first();
        }

        if (!wallet) {
            // Create new wallet with identifier as both userId and username
            const walletId = await ctx.db.insert("wallets", {
                userId: args.identifier,
                username: args.identifier,
                coins: args.amount,
                updatedAt: Date.now(),
            });

            await ctx.db.insert("transactions", {
                userId: args.identifier,
                type: "topup",
                amount: args.amount,
                description: args.description,
                createdAt: Date.now(),
            });

            return await ctx.db.get(walletId);
        }

        await ctx.db.patch(wallet._id, {
            coins: wallet.coins + args.amount,
            updatedAt: Date.now(),
        });

        await ctx.db.insert("transactions", {
            userId: wallet.userId,
            type: "topup",
            amount: args.amount,
            description: args.description,
            createdAt: Date.now(),
        });

        return await ctx.db.get(wallet._id);
    },
});

export const deductCoins = mutation({
    args: {
        userId: v.string(),
        amount: v.number(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (!wallet || wallet.coins < args.amount) {
            throw new Error("Insufficient coins");
        }

        await ctx.db.patch(wallet._id, {
            coins: wallet.coins - args.amount,
            updatedAt: Date.now(),
        });

        await ctx.db.insert("transactions", {
            userId: args.userId,
            type: "purchase",
            amount: -args.amount,
            description: args.description,
            createdAt: Date.now(),
        });

        return await ctx.db.get(wallet._id);
    },
});

export const getTransactions = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("transactions")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(50);
    },
});
