import { v } from "convex/values";
import { query } from "./_generated/server";

export const isAdmin = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();
        return admin !== null;
    },
});
