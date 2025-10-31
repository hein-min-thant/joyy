"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { type } from "os";

export default function EditComic({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user } = useUser();
    const { id } = use(params);

    const isAdmin = useQuery(api.admins.isAdmin, user?.id ? { userId: user.id } : "skip");
    const comic = useQuery(api.comics.get, { id: id as Id<"comics"> });
    const updateComic = useMutation(api.comics.update);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [author, setAuthor] = useState("");
    const [price, setPrice] = useState("0");
    const [genre, setGenre] = useState("");
    const [category, setCategory] = useState("Manga");
    const [coverImage, setCoverImage] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (comic) {
            setTitle(comic.title);
            setDescription(comic.description);
            setAuthor(comic.author);
            setPrice(comic.price.toString());
            setGenre(comic.genre.join(", "));
            setCategory(comic.category);
            setCoverImage(comic.coverImage);
        }
    }, [comic]);

    if (isAdmin === false) {
        router.push("/");
        return null;
    }

    if (!isAdmin || !comic) {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
                    <div className="inline-block h-6 w-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const genreArray = genre.split(",").map((g) => g.trim()).filter(Boolean);
            await updateComic({
                id: id as Id<"comics">,
                title,
                description,
                author,
                price: parseFloat(price),
                genre: genreArray,
                category,
                coverImage,
            });

            toast.success("Comic updated successfully.");
            router.push("/admin");
        } catch (error) {
            toast.error("Failed to update comic. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

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

                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Edit Comic
                        </h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Update comic information. Use "Chapters" to manage chapters and pages.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="title" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="author" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Author
                            </label>
                            <input
                                id="author"
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                required
                                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                required
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="category" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Category
                            </label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                            >
                                <option value="Marvel">Marvel</option>
                                <option value="DC">DC</option>
                                <option value="Manga">Manga</option>
                                <option value="Manhwa">Manhwa</option>
                                <option value="Webtoon">Webtoon</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="genre" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Genre (comma-separated)
                            </label>
                            <input
                                id="genre"
                                type="text"
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                                placeholder="Action, Adventure, Fantasy"
                                required
                                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="price" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Price (Coins, 0 for free)
                            </label>
                            <input
                                id="price"
                                type="number"
                                step="1"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="cover" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Cover Image URL
                            </label>
                            <input
                                id="cover"
                                type="url"
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                placeholder="https://..."
                                required
                                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                            />
                        </div>

                        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                💡 To manage chapters and pages, go back to the dashboard and click the "Chapters" button on this comic.
                            </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                type="submit"
                                disabled={updating}
                                className="flex-1 h-10 px-4 inline-flex items-center justify-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                            >
                                {updating ? "Updating..." : "Update Comic"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push("/admin")}
                                className="h-10 px-4 inline-flex items-center text-sm font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
