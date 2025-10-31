"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Coins } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface Comic {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  price: number;
  author: string;
  genre: string[];
  category: string;
}

export function ComicCard({ comic }: { comic: Comic }) {
  const { user } = useUser();
  const [isToggling, setIsToggling] = useState(false);

  const isFavorited = useQuery(
    api.favorites.isFavorited,
    user?.id ? { userId: user.id, comicId: comic._id as Id<"comics"> } : "skip"
  );
  const toggleFavorite = useMutation(api.favorites.toggle);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to add favorites");
      return;
    }

    setIsToggling(true);
    try {
      const result = await toggleFavorite({
        userId: user.id,
        comicId: comic._id as Id<"comics">,
      });
      toast.success(result.favorited ? "Added to favorites" : "Removed from favorites");
    } catch {
      toast.error("Failed to update favorites");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="relative group">
      <Link href={`/comic/${comic._id}`} className="block">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-black hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
          {/* Image */}
          <div className="aspect-[2/3] relative overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Image
              src={comic.coverImage}
              alt={comic.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
            />

            {/* Category badge */}
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/90 dark:bg-black/90 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
                {comic.category}
              </span>
            </div>

            {/* Price badge */}
            <div className="absolute bottom-2 right-2">
              {comic.price === 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500 text-white">
                  FREE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white/90 dark:bg-black/90 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
                  <Coins className="h-2.5 w-2.5" />
                  {comic.price}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
              {comic.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1">
              {comic.author}
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              {comic.genre.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="text-[10px] text-gray-400 dark:text-gray-600"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        disabled={isToggling}
        className={`absolute top-2 right-2 z-10 h-6 w-6 inline-flex items-center justify-center rounded border transition-colors ${isFavorited
            ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
            : "bg-white/90 dark:bg-black/90 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500"
          }`}
      >
        {isToggling ? (
          <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Heart className={`h-3 w-3 ${isFavorited ? "fill-current" : ""}`} />
        )}
      </button>
    </div>
  );
}
