"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { ComicCard } from "@/components/ComicCard";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

export default function Library() {
    const router = useRouter();
    const { user, isSignedIn } = useUser();
    const purchases = useQuery(
        api.purchases.userPurchases,
        user?.id ? { userId: user.id } : "skip"
    );

    if (!isSignedIn) {
        router.push("/sign-in");
        return null;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">My Library</h1>
                    {purchases && purchases.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {purchases.length} {purchases.length === 1 ? "comic" : "comics"}
                        </p>
                    )}
                </div>

                {!purchases ? (
                    <div className="text-center py-20">
                        <div className="inline-block h-6 w-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                            You haven't purchased any comics yet
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="h-10 px-4 inline-flex items-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity"
                        >
                            Explore Comics
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {purchases.map((comic) => (
                            <ComicCard key={comic._id} comic={comic} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
