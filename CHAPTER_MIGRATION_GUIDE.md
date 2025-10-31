# Chapter System Migration Guide

## Overview
This guide explains how to migrate from the page-based system to a chapter-based system.

## Schema Changes Required

Add this to your `convex/schema.ts`:

```typescript
chapters: defineTable({
    comicId: v.id("comics"),
    chapterNumber: v.number(),
    title: v.string(),
    price: v.number(), // 0 for free chapters
    createdAt: v.number(),
    updatedAt: v.number(),
})
    .index("by_comic", ["comicId", "chapterNumber"]),
```

Update the `pages` table:

```typescript
pages: defineTable({
    chapterId: v.id("chapters"), // Changed from comicId
    pageNumber: v.number(),
    imageUrl: v.string(),
})
    .index("by_chapter", ["chapterId", "pageNumber"]),
```

Add chapter purchases table:

```typescript
chapterPurchases: defineTable({
    userId: v.string(),
    chapterId: v.id("chapters"),
    purchasedAt: v.number(),
})
    .index("by_user", ["userId"])
    .index("by_chapter", ["chapterId"])
    .index("by_user_and_chapter", ["userId", "chapterId"]),
```

Update `readingProgress`:

```typescript
readingProgress: defineTable({
    userId: v.string(),
    comicId: v.id("comics"),
    chapterId: v.id("chapters"), // Add this
    currentPage: v.number(),
    totalPages: v.number(),
    lastReadAt: v.number(),
})
    .index("by_user", ["userId"])
    .index("by_user_and_comic", ["userId", "comicId"])
    .index("by_user_and_chapter", ["userId", "chapterId"]) // Add this
    .index("by_last_read", ["userId", "lastReadAt"]),
```

## Migration Steps

1. **Backup your data** before making any changes
2. Update `convex/schema.ts` with the new tables
3. Run `npx convex dev` to apply schema changes
4. Migrate existing data (if any):
   - Create a default chapter for each comic
   - Move pages from comic to chapter
5. Update all API calls to use new chapter system

## New User Flow

1. User views comic detail page
2. Sees list of chapters
3. Clicks on a chapter
4. If chapter is free OR user purchased comic OR user purchased chapter:
   - Navigate to reading page for that chapter
5. Otherwise:
   - Show purchase dialog for chapter or full comic

## Benefits

- ✅ Better organization (chapters → pages)
- ✅ Flexible pricing (per chapter or full comic)
- ✅ Better reading progress tracking
- ✅ Easier content management
- ✅ Industry standard structure
