"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { ArrowLeft, Coins } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function UserManagement() {
    const router = useRouter();
    const { user } = useUser();
    const isAdmin = useQuery(api.admins.isAdmin, user?.id ? { userId: user.id } : "skip");
    const topup = useMutation(api.wallets.topup);

    const [userId, setUserId] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchUsername, setSearchUsername] = useState("");

    const userSearch = useQuery(
        api.wallets.searchByUsername,
        searchUsername.length >= 2 ? { username: searchUsername } : "skip"
    );

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

    const handleTopup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await topup({
                identifier: userId,
                amount: parseInt(amount),
                description: `Admin top-up: ${amount} coins`,
            });
            toast.success(`Added ${amount} coins to ${userId}`);
            setUserId("");
            setAmount("");
        } catch (error) {
            toast.error("Failed to top up user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <Link href="/admin">
                    <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors mb-6">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Dashboard
                    </button>
                </Link>

                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
                                <Coins className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    User Coin Management
                                </h1>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Add coins to user accounts
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleTopup} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="search" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Search by Username
                            </label>
                            <input
                                id="search"
                                type="text"
                                value={searchUsername}
                                onChange={(e) => setSearchUsername(e.target.value.toLowerCase())}
                                placeholder="Type username to search..."
                                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                            />
                            {userSearch && (
                                <div className="p-3 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900">
                                    <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">User Found:</p>
                                    <p className="text-sm text-green-900 dark:text-green-100">Username: {userSearch.username}</p>
                                    <p className="text-xs text-green-700 dark:text-green-300">Current Balance: {userSearch.coins} coins</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUserId(userSearch.username);
                                            setSearchUsername("");
                                        }}
                                        className="mt-2 h-7 px-2 text-xs font-medium bg-green-600 dark:bg-green-700 text-white rounded-md hover:opacity-80"
                                    >
                                        Use this user
                                    </button>
                                </div>
                            )}
                            {searchUsername.length >= 2 && !userSearch && (
                                <p className="text-xs text-red-600 dark:text-red-400">No user found with username "{searchUsername}"</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="userId" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Username or User ID
                            </label>
                            <input
                                id="userId"
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="username or user_xxxxxxxxxxxxx"
                                required
                                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                Or enter manually if you know the username/ID
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="amount" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Amount (Coins)
                            </label>
                            <input
                                id="amount"
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="100"
                                required
                                className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 px-4 inline-flex items-center justify-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Top Up User"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
