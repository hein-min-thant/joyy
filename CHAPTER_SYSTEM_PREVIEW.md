# Chapter System - UI Preview

## Comic Detail Page with Chapters

The comic detail page will show:

1. **Comic Info** (cover, title, description, author)
2. **Chapter List** (scrollable list of all chapters)
3. **Purchase Options**:
   - Buy full comic (all chapters)
   - Buy individual chapter

## Chapter List Design (Geist Style)

```
┌─────────────────────────────────────┐
│ Chapters (24)                       │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Chapter 1: The Beginning    FREE│ │
│ │ 24 pages • 2 days ago           │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Chapter 2: Rising Action   🔒 5 │ │
│ │ 28 pages • 1 day ago            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Chapter 3: The Twist       🔒 5 │ │
│ │ 32 pages • 12 hours ago         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Reading Flow

1. Click chapter → Check access
2. If has access → `/read/[comicId]/[chapterId]`
3. If no access → Show purchase dialog

## Admin Upload Flow

1. Create comic (basic info)
2. Add chapters (one by one)
3. For each chapter, add pages
4. Set chapter pricing

Would you like me to implement this system?
