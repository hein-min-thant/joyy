import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    comics: defineTable({
        title: v.string(),
        description: v.string(),
        coverImage: v.string(),
        price: v.number(),
        author: v.string(),
        genre: v.array(v.string()),
        category: v.string(), // Marvel, DC, Manga, Manhwa, etc.
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_creation", ["createdAt"])
        .index("by_category", ["category"])
        .searchIndex("search_title", {
            searchField: "title",
            filterFields: ["category"],
        }),

    chapters: defineTable({
        comicId: v.id("comics"),
        chapterNumber: v.number(),
        title: v.string(),
        price: v.number(), // 0 for free chapters
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_comic", ["comicId", "chapterNumber"]),

    pages: defineTable({
        chapterId: v.optional(v.id("chapters")),
        comicId: v.optional(v.id("comics")), // Legacy field for backward compatibility
        pageNumber: v.number(),
        imageUrl: v.string(),
    })
        .index("by_chapter", ["chapterId", "pageNumber"])
        .index("by_comic", ["comicId", "pageNumber"]),

    purchases: defineTable({
        userId: v.string(),
        comicId: v.id("comics"),
        purchasedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_comic", ["comicId"])
        .index("by_user_and_comic", ["userId", "comicId"]),

    chapterPurchases: defineTable({
        userId: v.string(),
        chapterId: v.id("chapters"),
        purchasedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_chapter", ["chapterId"])
        .index("by_user_and_chapter", ["userId", "chapterId"]),

    admins: defineTable({
        userId: v.string(),
    }).index("by_user", ["userId"]),

    wallets: defineTable({
        userId: v.string(),
        username: v.string(),
        coins: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_username", ["username"]),

    transactions: defineTable({
        userId: v.string(),
        type: v.string(), // "topup", "purchase", "refund"
        amount: v.number(),
        description: v.string(),
        createdAt: v.number(),
    }).index("by_user", ["userId"]),

    readingProgress: defineTable({
        userId: v.string(),
        comicId: v.id("comics"),
        chapterId: v.optional(v.id("chapters")), // Optional for backward compatibility
        currentPage: v.number(),
        totalPages: v.number(),
        lastReadAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_and_comic", ["userId", "comicId"])
        .index("by_user_and_chapter", ["userId", "chapterId"])
        .index("by_last_read", ["userId", "lastReadAt"]),

    favorites: defineTable({
        userId: v.string(),
        comicId: v.id("comics"),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_comic", ["comicId"])
        .index("by_user_and_comic", ["userId", "comicId"]),

    reviews: defineTable({
        userId: v.string(),
        comicId: v.id("comics"),
        rating: v.number(), // 1-5 stars
        comment: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_comic", ["comicId"])
        .index("by_user", ["userId"])
        .index("by_user_and_comic", ["userId", "comicId"]),

    readingHistory: defineTable({
        userId: v.string(),
        comicId: v.id("comics"),
        lastReadAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_and_time", ["userId", "lastReadAt"]),

    follows: defineTable({
        userId: v.string(),
        targetType: v.string(), // "comic" or "author"
        targetId: v.string(), // comicId or author name
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_target", ["targetType", "targetId"]),

    userProfiles: defineTable({
        userId: v.string(),
        displayName: v.string(),
        bio: v.string(),
        avatar: v.optional(v.string()),
        badges: v.array(v.string()),
        totalRead: v.number(),
        totalReviews: v.number(),
        memberSince: v.number(),
        isPublic: v.boolean(),
        theme: v.string(), // "light" or "dark"
    }).index("by_user", ["userId"]),

    notifications: defineTable({
        userId: v.string(),
        type: v.string(), // "new_chapter", "low_balance", "purchase", "follow"
        title: v.string(),
        message: v.string(),
        read: v.boolean(),
        link: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_and_read", ["userId", "read"]),

    coinPackages: defineTable({
        name: v.string(),
        coins: v.number(),
        price: v.number(), // in dollars
        bonus: v.number(), // bonus coins
        popular: v.boolean(),
        active: v.boolean(),
    }),

    subscriptions: defineTable({
        userId: v.string(),
        plan: v.string(), // "monthly", "yearly"
        status: v.string(), // "active", "cancelled", "expired"
        startDate: v.number(),
        endDate: v.number(),
        autoRenew: v.boolean(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"]),

    featured: defineTable({
        comicId: v.id("comics"),
        priority: v.number(), // higher = more prominent
        startDate: v.number(),
        endDate: v.optional(v.number()),
        active: v.boolean(),
    })
        .index("by_active", ["active"])
        .index("by_priority", ["priority"]),

    analytics: defineTable({
        comicId: v.id("comics"),
        views: v.number(),
        purchases: v.number(),
        favorites: v.number(),
        averageRating: v.number(),
        revenue: v.number(),
        lastUpdated: v.number(),
    }).index("by_comic", ["comicId"]),

    reservedUsernames: defineTable({
        username: v.string(),
        createdAt: v.number(),
        createdBy: v.string(), // Admin user ID who reserved it
    }).index("by_username", ["username"]),

    bannedUsers: defineTable({
        userId: v.string(),
        reason: v.string(),
        type: v.string(), // "ban" or "suspend"
        bannedBy: v.string(), // Admin user ID
        bannedAt: v.number(),
        expiresAt: v.optional(v.number()), // For suspensions
        isActive: v.boolean(),
    })
        .index("by_user", ["userId"])
        .index("by_active", ["isActive"]),
});
