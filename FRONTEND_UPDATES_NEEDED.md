# Frontend Updates for Chapter System

## Summary of Changes Needed

### 1. Comic Detail Page (`app/comic/[id]/page.tsx`)

**Add:**
- Query for chapters: `const chapters = useQuery(api.chapters.listByComic, { comicId: id })`
- Chapter list section showing all chapters
- Click chapter → check access → navigate to `/read/${comicId}/${chapterId}`

**Replace "Read Now" button with:**
- Chapter list (each chapter clickable)
- Show lock icon for paid chapters
- Show "FREE" badge for free chapters

### 2. Reading Page (Create new: `app/read/[comicId]/[chapterId]/page.tsx`)

**Change from:**
- `/read/[id]/page.tsx` (reads comic pages)

**To:**
- `/read/[comicId]/[chapterId]/page.tsx` (reads chapter pages)

**Updates:**
- Load pages from chapter, not comic
- Check chapter access before showing pages
- Add chapter navigation (prev/next chapter)

### 3. Admin Upload (`app/admin/upload/page.tsx`)

**Change workflow:**
1. Create comic (basic info)
2. Add chapters (title, number, price)
3. Add pages to each chapter

**New UI:**
- Step-based form
- Chapter management section
- Pages per chapter

### 4. Admin Edit (`app/admin/edit/[id]/page.tsx`)

**Add:**
- Chapter list with edit/delete
- Add new chapter button
- Manage pages per chapter

## Implementation Priority

1. ✅ Backend (Complete)
2. 🔄 Comic Detail Page (Show chapters)
3. 🔄 Reading Page (Chapter-based)
4. 🔄 Admin Upload (Chapter workflow)
5. 🔄 Admin Edit (Chapter management)

## Status

Backend is complete. Frontend updates are in progress.

I'll update each file now with the chapter system.
