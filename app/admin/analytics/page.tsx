"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, DollarSign, Star, Eye } from "lucide-react";
import Link from "next/link";

export default function AnalyticsDashboard() {
    const router = useRouter();
    const { user } = useUser();
    const isAdmin = useQuery(api.admins.isAdmin, user?.id ? { userId: user.id } : "skip");
    const topComics = useQuery(api.analytics.getTopComics, { limit: 10 });
    const totalRevenue = useQuery(api.analytics.getTotalRevenue);
    const allComics = useQuery(api.comics.list, {});

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

    const totalViews = topComics?.reduce((sum: number, c: any) => sum + (c.analytics?.views || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <Link href="/admin">
                    <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors mb-6">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Dashboard
                    </button>
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Analytics Dashboard
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Overview of platform performance and metrics
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Comics */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Total Comics
                            </span>
                            <div className="p-1 bg-gray-100 dark:bg-gray-900 rounded">
                                <TrendingUp className="h-3 w-3 text-gray-900 dark:text-gray-100" />
                            </div>
                        </div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {allComics?.length || 0}
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Total Revenue
                            </span>
                            <div className="p-1 bg-gray-100 dark:bg-gray-900 rounded">
                                <DollarSign className="h-3 w-3 text-gray-900 dark:text-gray-100" />
                            </div>
                        </div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {totalRevenue || 0}
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">Coins</p>
                    </div>

                    {/* Top Sellers */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Top Sellers
                            </span>
                            <div className="p-1 bg-gray-100 dark:bg-gray-900 rounded">
                                <Star className="h-3 w-3 text-gray-900 dark:text-gray-100" />
                            </div>
                        </div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {topComics?.length || 0}
                        </div>
                    </div>

                    {/* Total Views */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Total Views
                            </span>
                            <div className="p-1 bg-gray-100 dark:bg-gray-900 rounded">
                                <Eye className="h-3 w-3 text-gray-900 dark:text-gray-100" />
                            </div>
                        </div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {totalViews}
                        </div>
                    </div>
                </div>

                {/* Top Comics Table */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Top Performing Comics
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="text-left p-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                                        Rank
                                    </th>
                                    <th className="text-left p-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                                        Title
                                    </th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                                        Views
                                    </th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                                        Purchases
                                    </th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                                        Revenue
                                    </th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                                        Rating
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {topComics && topComics.length > 0 ? (
                                    topComics.map((comic: any, index: number) => (
                                        <tr
                                            key={comic._id}
                                            className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                        >
                                            <td className="p-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                #{index + 1}
                                            </td>
                                            <td className="p-3">
                                                <Link
                                                    href={`/comic/${comic._id}`}
                                                    className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline"
                                                >
                                                    {comic.title}
                                                </Link>
                                            </td>
                                            <td className="p-3 text-right text-sm text-gray-900 dark:text-gray-100">
                                                {comic.analytics?.views || 0}
                                            </td>
                                            <td className="p-3 text-right text-sm text-gray-900 dark:text-gray-100">
                                                {comic.analytics?.purchases || 0}
                                            </td>
                                            <td className="p-3 text-right text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                {comic.analytics?.revenue || 0}
                                            </td>
                                            <td className="p-3 text-right text-sm text-gray-900 dark:text-gray-100">
                                                {comic.analytics?.averageRating
                                                    ? `⭐ ${comic.analytics.averageRating.toFixed(1)}`
                                                    : "N/A"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-sm text-gray-500 dark:text-gray-500">
                                            No data available yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
