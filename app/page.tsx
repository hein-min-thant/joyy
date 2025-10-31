"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ComicCard } from "@/components/ComicCard";
import { Navbar } from "@/components/Navbar";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { Doc } from "@/convex/_generated/dataModel";
import { Search, TrendingUp, Clock } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const CATEGORIES = ["All", "Marvel", "DC", "Manga", "Manhwa", "Webtoon", "Other"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceFilter, setPriceFilter] = useState("all");

  const comics = useQuery(
    api.comics.list,
    selectedCategory === "All" ? {} : { category: selectedCategory }
  );

  let displayComics = comics;

  if (displayComics && priceFilter !== "all") {
    displayComics = displayComics.filter((comic: any) =>
      priceFilter === "free" ? comic.price === 0 : comic.price > 0
    );
  }

  if (displayComics) {
    displayComics = [...displayComics].sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest": return b.createdAt - a.createdAt;
        case "oldest": return a.createdAt - b.createdAt;
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        default: return 0;
      }
    });
  }

  const { user } = useUser();
  const continueReading = useQuery(
    api.readingProgress.getContinueReading,
    user?.id ? { userId: user.id } : "skip"
  );
  const featuredComics = useQuery(api.featured.list);

  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for comics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 inline-flex items-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity"
            >
              Search
            </button>
          </div>
        </form>

        {/* Featured Carousel */}
        {featuredComics && featuredComics.length > 0 ? (
          <div className="mb-12">
            <FeaturedCarousel comics={featuredComics.slice(0, 5)} />
          </div>
        ) : comics && comics.length > 0 ? (
          <div className="mb-12">
            <FeaturedCarousel comics={comics.slice(0, 5)} />
          </div>
        ) : null}

        {/* Filters */}
        <div className="mb-12 space-y-6">
          {/* Categories */}
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

          {/* Sort & Price */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 px-3 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="h-8 px-3 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
            >
              <option value="all">All Prices</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Only</option>
            </select>
          </div>
        </div>

        {/* Continue Reading */}
        {continueReading && continueReading.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-4 w-4 text-gray-900 dark:text-gray-100" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Continue Reading</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {continueReading.map((item: any) => (
                <div key={item._id} className="relative group">
                  <ComicCard comic={item} />
                  {/* Progress overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/95 dark:bg-black/95 border-t border-gray-200 dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                    <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-gray-900 dark:bg-gray-100"
                        style={{
                          width: `${(item.progress.currentPage / item.progress.totalPages) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 text-center">
                      Page {item.progress.currentPage} of {item.progress.totalPages}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Comics */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-4 w-4 text-gray-900 dark:text-gray-100" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              All Comics
            </h2>
          </div>

          {!displayComics ? (
            <div className="text-center py-20">
              <div className="inline-block h-6 w-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
            </div>
          ) : displayComics.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                No comics available yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayComics.map((comic: Doc<"comics">) => (
                <ComicCard key={comic._id} comic={comic} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
