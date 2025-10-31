"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, TrendingUp, Star, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function AdminDashboard() {
    const router = useRouter();
    const { user } = useUser();
    const isAdmin = useQuery(api.admins.isAdmin, user?.id ? { userId: user.id } : "skip");
    const comics = useQuery(api.comics.list, {});
    const removeComic = useMutation(api.comics.remove);

    if (isAdmin === false) {
        router.push("/");
        return null;
    }

    if (!isAdmin || !comics) {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
                    <div className="inline-block h-6 w-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) {
            return;
        }

        try {
            await removeComic({ id: id as any });
            toast.success(`"${title}" has been deleted.`);
        } catch (error) {
            toast.error("Failed to delete comic.");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Manage comics, users, and analytics
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/admin/analytics">
                            <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                <TrendingUp className="h-3.5 w-3.5" />
                                Analytics
                            </button>
                        </Link>
                        <Link href="/admin/featured">
                            <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                <Star className="h-3.5 w-3.5" />
                                Featured
                            </button>
                        </Link>
                        <Link href="/admin/users">
                            <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                <Users className="h-3.5 w-3.5" />
                                Users
                            </button>
                        </Link>
                        <Link href="/admin/reserved-usernames">
                            <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                <Users className="h-3.5 w-3.5" />
                                Reserved
                            </button>
                        </Link>
                        <Link href="/admin/banned-users">
                            <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                <Users className="h-3.5 w-3.5" />
                                Banned
                            </button>
                        </Link>
                        <Link href="/admin/upload">
                            <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity">
                                <Plus className="h-3.5 w-3.5" />
                                Add Comic
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Comics Grid */}
                {comics.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                            No comics yet. Add your first comic!
                        </p>
                        <Link href="/admin/upload">
                            <button className="h-10 px-4 inline-flex items-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity">
                                Add Comic
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {comics.map((comic) => (
                            <div key={comic._id} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-black hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                                <div className="aspect-[2/3] relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                                    <Image src={comic.coverImage} alt={comic.title} fill className="object-cover" />
                                </div>
                                <div className="p-3 space-y-2">
                                    <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded">
                                        {comic.category}
                                    </span>
                                    <h3 className="font-semibold text-sm line-clamp-1 text-gray-900 dark:text-gray-100">
                                        {comic.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                        {comic.author}
                                    </p>
                                    <div className="space-y-2 pt-1">
                                        <Link href={`/admin/chapters/${comic._id}`} className="block">
                                            <button className="w-full h-8 px-2 inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity">
                                                <BookOpen className="h-3 w-3" />
                                                Chapters
                                            </button>
                                        </Link>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/edit/${comic._id}`} className="flex-1">
                                                <button className="w-full h-8 px-2 inline-flex items-center justify-center gap-1.5 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                                    <Pencil className="h-3 w-3" />
                                                    Edit
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(comic._id, comic.title)}
                                                className="h-8 w-8 inline-flex items-center justify-center border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
