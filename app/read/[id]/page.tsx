"use client";

import { use, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";

export default function ReadComic({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user } = useUser();
    const { id } = use(params);
    const comic = useQuery(api.comics.get, { id: id as Id<"comics"> });
    const chapters = useQuery(api.chapters.listByComic, { comicId: id as Id<"comics"> });
    const firstChapter = chapters?.[0];

    // Try to get pages by chapter first, fallback to legacy comicId query
    const chapterPages = useQuery(
        api.pages.list,
        firstChapter ? { chapterId: firstChapter._id } : "skip"
    );
    const legacyPages = useQuery(
        api.pages.listByComic,
        { comicId: id as Id<"comics"> }
    );

    // Use chapter pages if available, otherwise use legacy pages
    const pages = (chapterPages && chapterPages.length > 0) ? chapterPages : legacyPages;
    const updateProgress = useMutation(api.readingProgress.updateProgress);
    const addToHistory = useMutation(api.readingHistory.addToHistory);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const currentPageRef = useRef(1);

    useEffect(() => {
        if (!user || !pages || pages.length === 0) return;

        // Add to reading history
        addToHistory({ userId: user.id, comicId: id as Id<"comics"> });

        // Track which page is currently visible
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const pageNum = parseInt(entry.target.getAttribute("data-page") || "1");
                        currentPageRef.current = pageNum;
                    }
                });
            },
            { threshold: 0.5 }
        );

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [user, pages, id, addToHistory]);

    useEffect(() => {
        if (!user || !pages || pages.length === 0 || !firstChapter) return;

        const saveProgress = () => {
            updateProgress({
                userId: user.id,
                comicId: id as Id<"comics">,
                chapterId: firstChapter._id,
                currentPage: currentPageRef.current,
                totalPages: pages.length,
            });
        };

        // Save progress every 10 seconds
        const interval = setInterval(saveProgress, 10000);

        // Save on unmount
        return () => {
            clearInterval(interval);
            saveProgress();
        };
    }, [user, pages, id, firstChapter, updateProgress]);
    const hasPurchased = useQuery(
        api.purchases.hasPurchased,
        user?.id && comic ? { userId: user.id, comicId: comic._id } : "skip"
    );

    if (!comic || !pages) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    const canRead = comic.price === 0 || hasPurchased;

    if (!canRead) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl mb-4">Access Denied</h1>
                    <p className="mb-4">You need to purchase this comic to read it.</p>
                    <Button color="primary" onPress={() => router.push(`/comic/${id}`)}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="fixed top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Button
                        variant="light"
                        size="sm"
                        onPress={() => router.push(`/comic/${id}`)}
                        startContent={<ArrowLeft className="h-4 w-4" />}
                        className="text-white"
                    >
                        Back
                    </Button>
                    <h1 className="text-white font-semibold">{comic.title}</h1>
                    <div className="w-20" />
                </div>
            </div>
            <div className="pt-16 flex justify-center">
                {pages.length === 0 ? (
                    <div className="text-white text-center py-12">
                        No pages available yet
                    </div>
                ) : (
                    <div className="flex flex-col w-full max-w-full md:max-w-4xl lg:max-w-5xl">
                        {pages.map((page) => (
                            <div
                                key={page._id}
                                className="relative w-full"
                                data-page={page.pageNumber}
                                ref={(el) => {
                                    if (el && observerRef.current) {
                                        observerRef.current.observe(el);
                                    }
                                }}
                            >
                                <Image
                                    src={page.imageUrl}
                                    alt={`Page ${page.pageNumber}`}
                                    width={1200}
                                    height={1800}
                                    className="w-full h-auto"
                                    priority={page.pageNumber <= 3}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
