import { v } from "convex/values";
import { query } from "./_generated/server";

// Check if user has access to a chapter (free, purchased chapter, or purchased comic)
export const hasAccess = query({
    args: {
        userId: v.string(),
        chapterId: v.id("chapters"),
    },
    handler: async (ctx, args) => {
        // Get chapter
        const chapter = await ctx.db.get(args.chapterId);
        if (!chapter) {
            return false;
        }

        // Free chapters are accessible to everyone
        if (chapter.price === 0) {
            return true;
        }

        // Check if user purchased the full comic
        const comicPurchase = await ctx.db
            .query("purchases")
            .withIndex("by_user_and_comic", (q) =>
                q.eq("userId", args.userId).eq("comicId", chapter.comicId)
            )
            .first();

        if (comicPurchase) {
            return true;
        }

        // Check if user purchased this specific chapter
        const chapterPurchase = await ctx.db
            .query("chapterPurchases")
            .withIndex("by_user_and_chapter", (q) =>
                q.eq("userId", args.userId).eq("chapterId", args.chapterId)
            )
            .first();

        return chapterPurchase !== null;
    },
});
