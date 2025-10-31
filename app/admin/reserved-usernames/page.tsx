"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

const CORRECT_PASSWORD = "pp250903hhtk";

export default function ReservedUsernames() {
    const router = useRouter();
    const { user } = useUser();
    const isAdmin = useQuery(api.admins.isAdmin, user?.id ? { userId: user.id } : "skip");
    const reservedUsernames = useQuery(api.reservedUsernames.list);

    const addReserved = useMutation(api.reservedUsernames.add);
    const removeReserved = useMutation(api.reservedUsernames.remove);

    const [newUsername, setNewUsername] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [password, setPassword] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);

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

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === CORRECT_PASSWORD) {
            setIsUnlocked(true);
            toast.success("Access granted");
        } else {
            toast.error("Incorrect password");
            setPassword("");
        }
    };

    // Show password prompt if not unlocked
    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <Navbar />
                <main className="max-w-md mx-auto px-4 sm:px-6 py-20">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-4">
                            <Lock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Protected Page
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enter password to access reserved usernames
                        </p>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full h-12 px-4 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full h-12 inline-flex items-center justify-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity"
                        >
                            Unlock
                        </button>
                        <Link href="/admin">
                            <button
                                type="button"
                                className="w-full h-10 inline-flex items-center justify-center text-sm font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </Link>
                    </form>
                </main>
            </div>
        );
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim() || !user) return;

        if (newUsername.length < 5) {
            toast.error("Username must be at least 5 characters");
            return;
        }

        setIsAdding(true);
        try {
            await addReserved({
                username: newUsername.trim().toLowerCase(),
                adminUserId: user.id,
            });
            toast.success("Username reserved successfully");
            setNewUsername("");
        } catch (error: any) {
            toast.error(error.message || "Failed to reserve username");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemove = async (id: Id<"reservedUsernames">, username: string) => {
        if (!confirm(`Remove "${username}" from reserved list?`) || !user) return;

        try {
            await removeReserved({ id, adminUserId: user.id });
            toast.success("Username removed from reserved list");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove username");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <Link href="/admin">
                    <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors mb-6">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Dashboard
                    </button>
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Reserved Usernames
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage usernames that cannot be used by regular users
                    </p>
                </div>

                {/* Add Form */}
                <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg mb-6">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Reserve Username
                    </h2>
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            placeholder="Enter username to reserve (min 5 chars)"
                            minLength={5}
                            className="flex-1 h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                        />
                        <button
                            type="submit"
                            disabled={isAdding || newUsername.length < 5}
                            className="h-10 px-4 inline-flex items-center gap-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
                            Reserve
                        </button>
                    </form>
                </div>

                {/* Reserved List */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            Reserved Usernames ({reservedUsernames?.length || 0})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {reservedUsernames && reservedUsernames.length > 0 ? (
                            reservedUsernames.map((reserved) => (
                                <div
                                    key={reserved._id}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <div>
                                        <code className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {reserved.username}
                                        </code>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            Reserved on {new Date(reserved.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(reserved._id, reserved.username)}
                                        className="h-9 w-9 inline-flex items-center justify-center border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    No reserved usernames yet
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
