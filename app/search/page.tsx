"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ComicCard } from "@/components/ComicCard";
import { Navbar } from "@/components/Navbar";
import { Doc } from "@/convex/_generated/dataModel";
import { Search, X, SlidersHorizontal } from "lucide-react";

const CATEGORIES = ["All", "Marvel", "DC", "Manga", "Manhwa", "Webtoon", "Other"];
const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
];

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryParam = searchParams.get("q") || "";

    const [searchQuery, setSearchQuery] = useState(queryParam);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [priceFilter, setPriceFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);

    // Update search query when URL changes
    useEffect(() => {
        setSearchQuery(queryParam);
    }, [queryParam]);

    const searchResults = useQuery(
        api.comics.search,
        searchQuery.trim()
            ? {
                query: searchQuery,
                category: selectedCategory === "All" ? undefined : selectedCategory,
            }
            : "skip"
    );

    let displayComics = searchResults;

    if (displayComics && priceFilter !== "all") {
        displayComics = displayComics.filter((comic: any) =>
            priceFilter === "free" ? comic.price === 0 : comic.price > 0
        );
    }

    if (displayComics) {
        displayComics = [...displayComics].sort((a: any, b: any) => {
            switch (sortBy) {
                case "newest":
                    return b.createdAt - a.createdAt;
                case "oldest":
                    return a.createdAt - b.createdAt;
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                default:
                    return 0;
            }
        });
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for comics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-9 pr-10 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="h-10 px-4 inline-flex items-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="h-10 px-4 inline-flex items-center text-sm font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                            Back
                        </button>
                    </div>
                </form>

                {/* Filters Toggle */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="h-8 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Filters
                        {showFilters ? " (Hide)" : " (Show)"}
                    </button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mb-8 p-4 border border-gray-200 dark:border-gray-800 rounded-lg space-y-4">
                        {/* Categories */}
                        <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Category
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`h-8 px-3 inline-flex items-center text-xs font-medium rounded-md transition-colors ${selectedCategory === category
                                            ? "bg-black dark:bg-white text-white dark:text-black"
                                            : "border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort & Price */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full h-8 px-3 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Price
                                </label>
                                <select
                                    value={priceFilter}
                                    onChange={(e) => setPriceFilter(e.target.value)}
                                    className="w-full h-8 px-3 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                >
                                    <option value="all">All Prices</option>
                                    <option value="free">Free Only</option>
                                    <option value="paid">Paid Only</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                <div>
                    <div className="mb-6">
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {searchQuery ? `Search results for "${searchQuery}"` : "Search Comics"}
                        </h1>
                        {displayComics && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {displayComics.length} {displayComics.length === 1 ? "result" : "results"} found
                            </p>
                        )}
                    </div>

                    {!displayComics ? (
                        <div className="text-center py-20">
                            <div className="inline-block h-6 w-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
                        </div>
                    ) : displayComics.length === 0 ? (
                        <div className="text-center py-20">
                            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                                No comics found matching your search
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-600 mb-6">
                                Try different keywords or adjust your filters
                            </p>
                            <button
                                onClick={handleClearSearch}
                                className="h-10 px-4 inline-flex items-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity"
                            >
                                Browse All Comics
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {displayComics.map((comic: Doc<"comics">) => (
                                <ComicCard key={comic._id} comic={comic} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-black">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
                    <div className="inline-block h-6 w-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
                </div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
