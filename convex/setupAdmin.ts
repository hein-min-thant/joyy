import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Run this once in production to create your first admin
// Usage: npx convex run setupAdmin:createFirstAdmin '{"userId":"your-clerk-user-id"}' --prod
export const createFirstAdmin = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        // Check if admin already exists
        const existing = await ctx.db
            .query("admins")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (existing) {
            return { success: false, message: "Admin already exists" };
        }

        await ctx.db.insert("admins", {
            userId: args.userId,
        });

        return { success: true, message: "Admin created successfully" };
    },
});
