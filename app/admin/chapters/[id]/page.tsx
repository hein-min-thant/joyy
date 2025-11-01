"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, Upload, X, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ManageChapters({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user } = useUser();
    const unwrappedParams = use(params);
    const id = unwrappedParams?.id;

    const isAdmin = useQuery(api.admins.isAdmin, user?.id ? { userId: user.id } : "skip");
    const comic = useQuery(api.comics.get, id ? { id: id as Id<"comics"> } : "skip");
    const chapters = useQuery(api.chapters.listByComic, id ? { comicId: id as Id<"comics"> } : "skip");

    const createChapter = useMutation(api.chapters.create);
    const updateChapter = useMutation(api.chapters.update);
    const removeChapter = useMutation(api.chapters.remove);
    const addPage = useMutation(api.pages.add);
    const removePage = useMutation(api.pages.remove);

    const [showAddChapter, setShowAddChapter] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Id<"chapters"> | null>(null);
    const [chapterNumber, setChapterNumber] = useState("");
    const [chapterTitle, setChapterTitle] = useState("");
    const [chapterPrice, setChapterPrice] = useState("0");
    const [pages, setPages] = useState<string[]>([]);
    const [bulkUrls, setBulkUrls] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPages, setEditingPages] = useState(false);

    // Fetch existing pages when editing a chapter
    const existingPages = useQuery(
        api.pages.list,
        editingChapter ? { chapterId: editingChapter } : "skip"
    );

    // Redirect non-admins
    useEffect(() => {
        if (isAdmin === false) {
            router.push("/");
        }
    }, [isAdmin, router]);

    // Show loading state
    if (isAdmin === undefined || comic === undefined || chapters === undefined) {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
                    <div className="inline-block h-6 w-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    // Show not found state
    if (!comic || isAdmin === false) {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        {!comic ? "Comic not found" : "Access denied"}
                    </p>
                </div>
            </div>
        );
    }

    const handleAddChapter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pages.length === 0) {
            toast.error("Please add at least one page");
            return;
        }

        setIsSubmitting(true);
        try {
            const chapterId = await createChapter({
                comicId: id as Id<"comics">,
                chapterNumber: parseFloat(chapterNumber),
                title: chapterTitle,
                price: parseFloat(chapterPrice),
            });

            for (let i = 0; i < pages.length; i++) {
                await addPage({
                    chapterId,
                    pageNumber: i + 1,
                    imageUrl: pages[i],
                });
            }

            toast.success("Chapter added successfully!");
            setShowAddChapter(false);
            setChapterNumber("");
            setChapterTitle("");
            setChapterPrice("0");
            setPages([]);
            setBulkUrls("");
        } catch (error) {
            toast.error("Failed to add chapter");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditChapter = (chapterId: Id<"chapters">) => {
        const chapter = chapters?.find((c) => c._id === chapterId);
        if (!chapter) return;

        setEditingChapter(chapterId);
        setChapterNumber(chapter.chapterNumber.toString());
        setChapterTitle(chapter.title);
        setChapterPrice(chapter.price.toString());
        setShowAddChapter(false);
        setEditingPages(false);
        setPages([]);
        setBulkUrls("");
    };

    const handleStartEditingPages = () => {
        if (existingPages) {
            setPages(existingPages.map(p => p.imageUrl));
        }
        setEditingPages(true);
    };

    const handleUpdateChapter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingChapter) return;

        setIsSubmitting(true);
        try {
            await updateChapter({
                id: editingChapter,
                chapterNumber: parseFloat(chapterNumber),
                title: chapterTitle,
                price: parseFloat(chapterPrice),
            });

            toast.success("Chapter updated successfully!");
            setEditingChapter(null);
            setEditingPages(false);
            setChapterNumber("");
            setChapterTitle("");
            setChapterPrice("0");
            setPages([]);
            setBulkUrls("");
        } catch (error) {
            toast.error("Failed to update chapter");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePages = async () => {
        if (!editingChapter || pages.length === 0) {
            toast.error("Please add at least one page");
            return;
        }

        setIsSubmitting(true);
        try {
            // Delete all existing pages
            if (existingPages) {
                for (const page of existingPages) {
                    await removePage({ id: page._id });
                }
            }

            // Add new pages
            for (let i = 0; i < pages.length; i++) {
                await addPage({
                    chapterId: editingChapter,
                    pageNumber: i + 1,
                    imageUrl: pages[i],
                });
            }

            toast.success("Pages updated successfully!");
            setEditingPages(false);
            setPages([]);
            setBulkUrls("");
        } catch (error) {
            toast.error("Failed to update pages");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteChapter = async (chapterId: Id<"chapters">, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return;

        try {
            await removeChapter({ id: chapterId });
            toast.success("Chapter deleted");
        } catch (error) {
            toast.error("Failed to delete chapter");
        }
    };

    const addPageUrl = () => {
        setPages([...pages, ""]);
    };

    const updatePageUrl = (index: number, url: string) => {
        const newPages = [...pages];
        newPages[index] = url;
        setPages(newPages);
    };

    const removePageUrl = (index: number) => {
        setPages(pages.filter((_, i) => i !== index));
    };

    const processBulkUrls = () => {
        if (!bulkUrls.trim()) return;

        // Extract URLs - handles both space-separated and concatenated URLs
        const urlPattern = /https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp|bmp)/gi;
        const extractedUrls = bulkUrls.match(urlPattern) || [];

        if (extractedUrls.length === 0) {
            toast.error("No valid image URLs found");
            return;
        }

        setPages([...pages, ...extractedUrls]);
        setBulkUrls("");
        toast.success(`Added ${extractedUrls.length} pages`);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <Link href="/admin">
                    <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors mb-6">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Dashboard
                    </button>
                </Link>

                {/* Comic Info */}
                <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {comic.title}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage chapters for this comic
                    </p>
                </div>

                {/* Add Chapter Button */}
                {!showAddChapter && !editingChapter && (
                    <button
                        onClick={() => setShowAddChapter(true)}
                        className="h-10 px-4 inline-flex items-center gap-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity mb-6"
                    >
                        <Plus className="h-4 w-4" />
                        Add Chapter
                    </button>
                )}

                {/* Add Chapter Form */}
                {showAddChapter && (
                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden mb-6">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Add New Chapter
                            </h2>
                        </div>
                        <form onSubmit={handleAddChapter} className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Chapter Number
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={chapterNumber}
                                        onChange={(e) => setChapterNumber(e.target.value)}
                                        required
                                        className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Price (0 for free)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={chapterPrice}
                                        onChange={(e) => setChapterPrice(e.target.value)}
                                        required
                                        className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Chapter Title
                                </label>
                                <input
                                    type="text"
                                    value={chapterTitle}
                                    onChange={(e) => setChapterTitle(e.target.value)}
                                    required
                                    placeholder="e.g., The Beginning"
                                    className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Pages ({pages.length})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addPageUrl}
                                        className="h-8 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <Upload className="h-3 w-3" />
                                        Add Page
                                    </button>
                                </div>

                                {/* Bulk URL Paste */}
                                <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Bulk Paste URLs
                                    </label>
                                    <textarea
                                        value={bulkUrls}
                                        onChange={(e) => setBulkUrls(e.target.value)}
                                        placeholder="Paste multiple image URLs here (even without spaces between them)"
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={processBulkUrls}
                                        disabled={!bulkUrls.trim()}
                                        className="h-8 px-3 inline-flex items-center gap-2 text-xs font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                                    >
                                        <LinkIcon className="h-3 w-3" />
                                        Extract & Add URLs
                                    </button>
                                </div>

                                {pages.map((page, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="url"
                                            value={page}
                                            onChange={(e) => updatePageUrl(index, e.target.value)}
                                            placeholder={`Page ${index + 1} URL`}
                                            required
                                            className="flex-1 h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePageUrl(index)}
                                            className="h-10 w-10 inline-flex items-center justify-center border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-10 px-4 inline-flex items-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                                >
                                    {isSubmitting ? "Adding..." : "Add Chapter"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddChapter(false);
                                        setPages([]);
                                        setChapterNumber("");
                                        setChapterTitle("");
                                        setChapterPrice("0");
                                        setBulkUrls("");
                                    }}
                                    className="h-10 px-4 inline-flex items-center text-sm font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Edit Chapter Form */}
                {editingChapter && !editingPages && (
                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden mb-6">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Edit Chapter Metadata
                            </h2>
                        </div>
                        <form onSubmit={handleUpdateChapter} className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Chapter Number
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={chapterNumber}
                                        onChange={(e) => setChapterNumber(e.target.value)}
                                        required
                                        className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Price (0 for free)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={chapterPrice}
                                        onChange={(e) => setChapterPrice(e.target.value)}
                                        required
                                        className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Chapter Title
                                </label>
                                <input
                                    type="text"
                                    value={chapterTitle}
                                    onChange={(e) => setChapterTitle(e.target.value)}
                                    required
                                    placeholder="e.g., The Beginning"
                                    className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-10 px-4 inline-flex items-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                                >
                                    {isSubmitting ? "Updating..." : "Update Metadata"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStartEditingPages}
                                    className="h-10 px-4 inline-flex items-center gap-2 text-sm font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit Pages ({existingPages?.length || 0})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingChapter(null);
                                        setChapterNumber("");
                                        setChapterTitle("");
                                        setChapterPrice("0");
                                    }}
                                    className="h-10 px-4 inline-flex items-center text-sm font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Edit Pages Form */}
                {editingChapter && editingPages && (
                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden mb-6">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Edit Chapter Pages
                            </h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Current pages will be replaced with the new ones
                            </p>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Pages ({pages.length})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addPageUrl}
                                        className="h-8 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <Upload className="h-3 w-3" />
                                        Add Page
                                    </button>
                                </div>

                                {/* Bulk URL Paste */}
                                <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Bulk Paste URLs
                                    </label>
                                    <textarea
                                        value={bulkUrls}
                                        onChange={(e) => setBulkUrls(e.target.value)}
                                        placeholder="Paste multiple image URLs here (even without spaces between them)"
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={processBulkUrls}
                                        disabled={!bulkUrls.trim()}
                                        className="h-8 px-3 inline-flex items-center gap-2 text-xs font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                                    >
                                        <LinkIcon className="h-3 w-3" />
                                        Extract & Add URLs
                                    </button>
                                </div>

                                {pages.map((page, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="url"
                                            value={page}
                                            onChange={(e) => updatePageUrl(index, e.target.value)}
                                            placeholder={`Page ${index + 1} URL`}
                                            required
                                            className="flex-1 h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePageUrl(index)}
                                            className="h-10 w-10 inline-flex items-center justify-center border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleUpdatePages}
                                    disabled={isSubmitting || pages.length === 0}
                                    className="h-10 px-4 inline-flex items-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                                >
                                    {isSubmitting ? "Updating..." : "Update Pages"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingPages(false);
                                        setPages([]);
                                        setBulkUrls("");
                                    }}
                                    className="h-10 px-4 inline-flex items-center text-sm font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chapters List */}
                <div className="space-y-3">
                    {chapters && chapters.length > 0 ? (
                        chapters.map((chapter) => (
                            <div
                                key={chapter._id}
                                className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            Chapter {chapter.chapterNumber}: {chapter.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {chapter.price === 0 ? "Free" : `${chapter.price} Coins`}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditChapter(chapter._id)}
                                            className="h-9 px-3 inline-flex items-center gap-1.5 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteChapter(chapter._id, chapter.title)}
                                            className="h-9 w-9 inline-flex items-center justify-center border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                No chapters yet. Add your first chapter!
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
