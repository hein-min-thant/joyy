"use client";

import * as React from "react";
import { use, useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PurchaseDialog } from "./PurchaseDialog";
import { Star, Heart, Eye, ShoppingCart, BookOpen, ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardBody, Button, Chip, CardHeader, Divider, Textarea } from "@heroui/react";

export default function ComicDetail({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user } = useUser();
    const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [chapterSearch, setChapterSearch] = useState("");
    const { id } = use(params);

    const comic = useQuery(api.comics.get, { id: id as Id<"comics"> });
    const chapters = useQuery(api.chapters.listByComic, { comicId: id as Id<"comics"> });
    const hasPurchased = useQuery(
        api.purchases.hasPurchased,
        user?.id && comic ? { userId: user.id, comicId: comic._id } : "skip"
    );
    const averageRating = useQuery(api.reviews.getAverageRating, { comicId: id as Id<"comics"> });
    const reviews = useQuery(api.reviews.getComicReviews, { comicId: id as Id<"comics"> });
    const userReview = useQuery(
        api.reviews.getUserReview,
        user?.id ? { userId: user.id, comicId: id as Id<"comics"> } : "skip"
    );
    const isFavorited = useQuery(
        api.favorites.isFavorited,
        user?.id ? { userId: user.id, comicId: id as Id<"comics"> } : "skip"
    );
    const favoriteCount = useQuery(api.favorites.getComicFavoriteCount, { comicId: id as Id<"comics"> });
    const comicAnalytics = useQuery(api.analytics.getComicAnalytics, { comicId: id as Id<"comics"> });

    const createReview = useMutation(api.reviews.create);
    const toggleFavorite = useMutation(api.favorites.toggle);
    const incrementViews = useMutation(api.analytics.incrementViews);

    useEffect(() => {
        if (comic) {
            incrementViews({ comicId: id as Id<"comics"> });
        }
    }, [comic, id, incrementViews]);

    const handlePurchaseClick = () => {
        if (!user) {
            router.push("/sign-in");
            return;
        }
        setShowPurchaseDialog(true);
    };

    const handleRead = () => {
        router.push(`/read/${id}`);
    };

    const handleFavoriteToggle = async () => {
        if (!user) {
            router.push("/sign-in");
            return;
        }
        try {
            const result = await toggleFavorite({ userId: user.id, comicId: id as Id<"comics"> });
            toast.success(result.favorited ? "Added to favorites" : "Removed from favorites");
        } catch (error) {
            toast.error("Failed to update favorites");
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push("/sign-in");
            return;
        }
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            await createReview({
                userId: user.id,
                comicId: id as Id<"comics">,
                rating,
                comment,
            });
            toast.success("Review submitted!");
            setRating(0);
            setComment("");
        } catch (error) {
            toast.error("Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter chapters based on search (must be before early return)
    const filteredChapters = useMemo(() => {
        if (!chapters) return [];
        if (!chapterSearch.trim()) return chapters;

        const searchLower = chapterSearch.toLowerCase();
        return chapters.filter(
            (chapter) =>
                chapter.chapterNumber.toString().includes(searchLower) ||
                chapter.title.toLowerCase().includes(searchLower)
        );
    }, [chapters, chapterSearch]);

    if (!comic) {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
                    <div className="inline-block h-6 w-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    const canRead = comic.price === 0 || hasPurchased;

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                {/* Main Content */}
                <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 mb-16">
                    {/* Cover Image */}
                    <div className="mx-auto lg:mx-0">
                        <div className="aspect-[2/3] w-full max-w-[300px] relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                            <Image
                                src={comic.coverImage}
                                alt={comic.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-6">
                        {/* Title & Favorite */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    {comic.title}
                                </h1>
                                <p className="text-base text-gray-600 dark:text-gray-400">
                                    by {comic.author}
                                </p>
                            </div>
                            <button
                                onClick={handleFavoriteToggle}
                                className={`h-10 w-10 inline-flex items-center justify-center rounded-md border transition-colors ${isFavorited
                                    ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400"
                                    : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                                    }`}
                            >
                                <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-3 text-sm">
                            {averageRating && averageRating.count > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    <span className="font-medium">{averageRating.average.toFixed(1)}</span>
                                    <span className="text-amber-600 dark:text-amber-400">({averageRating.count})</span>
                                </div>
                            )}
                            {favoriteCount !== undefined && favoriteCount > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300">
                                    <Heart className="h-3.5 w-3.5 fill-current" />
                                    <span className="font-medium">{favoriteCount}</span>
                                </div>
                            )}
                            {comicAnalytics && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span className="font-medium">{comicAnalytics.views}</span>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        <div className="flex gap-2 flex-wrap">
                            <span className="h-7 px-2.5 inline-flex items-center text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                                {comic.category}
                            </span>
                            {comic.genre.map((g) => (
                                <span
                                    key={g}
                                    className="h-7 px-2.5 inline-flex items-center text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                    {g}
                                </span>
                            ))}
                        </div>

                        {/* Synopsis */}
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Synopsis
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {comic.description}
                            </p>
                        </div>

                        {/* Price & Purchase */}
                        {comic.price > 0 && (
                            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Comic Price</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {comic.price} Coins
                                        </p>
                                    </div>
                                </div>
                                {!canRead && (
                                    <button
                                        onClick={handlePurchaseClick}
                                        className="w-full h-10 inline-flex items-center justify-center gap-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Purchase Full Comic
                                    </button>
                                )}
                                {canRead && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="font-medium">Purchased</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Chapters List */}
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                                <div className="flex items-center justify-between gap-4 mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        Chapters ({chapters?.length || 0})
                                    </h3>
                                </div>
                                {/* Search Input */}
                                {chapters && chapters.length > 0 && (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search chapters..."
                                            value={chapterSearch}
                                            onChange={(e) => setChapterSearch(e.target.value)}
                                            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredChapters && filteredChapters.length > 0 ? (
                                    filteredChapters.map((chapter) => (
                                        <button
                                            key={chapter._id}
                                            onClick={() => router.push(`/read/${id}?chapter=${chapter._id}`)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Chapter {chapter.chapterNumber}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                                    {chapter.title}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {chapter.price === 0 ? "Free" : `${chapter.price} Coins`}
                                                </span>
                                                <BookOpen className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </button>
                                    ))
                                ) : chapters && chapters.length > 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            No chapters match your search
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            No chapters available yet
                                        </p>
                                        {!canRead && (
                                            <button
                                                onClick={handlePurchaseClick}
                                                className="mt-4 h-10 px-4 inline-flex items-center gap-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity"
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                                Purchase Comic
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Reviews & Ratings
                    </h2>

                    {/* Write Review Form */}
                    {user && (
                        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Write a Review
                            </h3>
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Your Rating
                                    </label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`h-7 w-7 ${star <= rating
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-gray-300 dark:text-gray-700"
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Your Review
                                    </label>
                                    <textarea
                                        placeholder="Share your thoughts..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-9 px-4 inline-flex items-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {reviews && reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div
                                    key={review._id}
                                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${star <= review.rating
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-gray-300 dark:text-gray-700"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center border border-gray-200 dark:border-gray-800 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    No reviews yet. Be the first to review!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {comic && (
                <PurchaseDialog
                    open={showPurchaseDialog}
                    onOpenChange={setShowPurchaseDialog}
                    comic={comic}
                    onSuccess={() => { }}
                />
            )}
        </div>
    );
}
