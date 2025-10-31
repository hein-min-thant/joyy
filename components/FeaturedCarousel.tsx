"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Comic {
    _id: string;
    title: string;
    description: string;
    coverImage: string;
    author: string;
    category: string;
}

interface FeaturedCarouselProps {
    comics: Comic[];
}

export function FeaturedCarousel({ comics }: FeaturedCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlaying || comics.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % comics.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, comics.length]);

    const goToPrevious = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + comics.length) % comics.length);
    };

    const goToNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % comics.length);
    };

    const goToSlide = (index: number) => {
        setIsAutoPlaying(false);
        setCurrentIndex(index);
    };

    if (!comics || comics.length === 0) return null;

    const currentComic = comics[currentIndex];

    return (
        <div className="relative w-full h-[400px] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={currentComic.coverImage}
                    alt={currentComic.title}
                    fill
                    className="object-cover opacity-40"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-black dark:via-black/60 dark:to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-end">
                <div className="w-full px-16 pb-8">
                    <div className="max-w-2xl">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-black dark:bg-white text-white dark:text-black rounded mb-3">
                            {currentComic.category}
                        </span>
                        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                            {currentComic.title}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            by {currentComic.author}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {currentComic.description}
                        </p>
                        <Link href={`/comic/${currentComic._id}`}>
                            <button className="h-9 px-4 inline-flex items-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity">
                                View Details
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {comics.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/3 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-white/90 dark:bg-black/90 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-white dark:hover:bg-black transition-colors"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-4 w-4 text-gray-900 dark:text-gray-100" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/3 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-white/90 dark:bg-black/90 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-white dark:hover:bg-black transition-colors"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-4 w-4 text-gray-900 dark:text-gray-100" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {comics.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {comics.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-1.5 rounded-full transition-all ${index === currentIndex
                                ? "w-6 bg-gray-900 dark:bg-gray-100"
                                : "w-1.5 bg-gray-400 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-400"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
