"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function FeaturedManagement() {
    const router = useRouter();
    const { user } = useUser();
    const isAdmin = useQuery(api.admins.isAdmin, user?.id ? { userId: user.id } : "skip");
    const comics = useQuery(api.comics.list, {});
    const featured = useQuery(api.featured.list);

    const addFeatured = useMutation(api.featured.add);
    const removeFeatured = useMutation(api.featured.remove);

    const [selectedComic, setSelectedComic] = useState("");
    const [priority, setPriority] = useState("1");

    if (isAdmin === false) {
        router.push("/");
        return null;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
                    <div className="inline-block h-6 w-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    const handleAddFeatured = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedComic) return;

        try {
            await addFeatured({
                comicId: selectedComic as Id<"comics">,
                priority: parseInt(priority),
                startDate: Date.now(),
            });
            toast.success("Comic added to featured section");
            setSelectedComic("");
            setPriority("1");
        } catch (error) {
            toast.error("Failed to add featured comic");
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await removeFeatured({ id: id as Id<"featured"> });
            toast.success("Comic removed from featured");
        } catch (error) {
            toast.error("Failed to remove");
        }
    };

    const featuredIds = featured?.map((c: any) => c._id) || [];

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <Link href="/admin">
                    <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors mb-6">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Dashboard
                    </button>
                </Link>

                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
                    Featured Comics Management
                </h1>

                {/* Add Featured Comic */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Add Featured Comic
                        </h2>
                    </div>
                    <form onSubmit={handleAddFeatured} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Select Comic
                            </label>
                            <select
                                value={selectedComic}
                                onChange={(e) => setSelectedComic(e.target.value)}
                                required
                                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                            >
                                <option value="">Choose a comic...</option>
                                {comics
                                    ?.filter((c: any) => !featuredIds.includes(c._id))
                                    .map((comic: any) => (
                                        <option key={comic._id} value={comic._id}>
                                            {comic.title}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Priority (higher = more prominent)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                required
                                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-10 px-4 inline-flex items-center gap-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity"
                        >
                            <Star className="h-4 w-4" />
                            Add to Featured
                        </button>
                    </form>
                </div>

                {/* Current Featured Comics */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Currently Featured ({featured?.length || 0})
                        </h2>
                    </div>
                    <div className="p-6">
                        {featured && featured.length > 0 ? (
                            <div className="space-y-2">
                                {featured.map((comic: any) => (
                                    <div
                                        key={comic._id}
                                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                {comic.title}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                                {comic.category} • {comic.price === 0 ? "Free" : `${comic.price} coins`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(comic._id)}
                                            className="h-8 w-8 inline-flex items-center justify-center border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-500 py-8">
                                No featured comics yet
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
