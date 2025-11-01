"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ban, Clock, Unlock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function BannedUsers() {
    const router = useRouter();
    const { user } = useUser();
    const isAdmin = useQuery(api.admins.isAdmin, user?.id ? { userId: user.id } : "skip");
    const bannedUsers = useQuery((api as any).bannedUsers?.list, { includeInactive: false });

    const banUser = useMutation((api as any).bannedUsers?.banUser);
    const suspendUser = useMutation((api as any).bannedUsers?.suspendUser);
    const unbanUser = useMutation((api as any).bannedUsers?.unbanUser);

    const [showBanDialog, setShowBanDialog] = useState(false);
    const [banType, setBanType] = useState<"ban" | "suspend">("ban");
    const [targetUserId, setTargetUserId] = useState("");
    const [reason, setReason] = useState("");
    const [suspendDays, setSuspendDays] = useState("7");
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const handleBanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !targetUserId.trim() || !reason.trim()) return;

        setIsSubmitting(true);
        try {
            if (banType === "ban") {
                await banUser({
                    identifier: targetUserId.trim(),
                    reason: reason.trim(),
                    adminUserId: user.id,
                });
                toast.success("User banned successfully");
            } else {
                await suspendUser({
                    identifier: targetUserId.trim(),
                    reason: reason.trim(),
                    days: parseInt(suspendDays),
                    adminUserId: user.id,
                });
                toast.success(`User suspended for ${suspendDays} days`);
            }
            setShowBanDialog(false);
            setTargetUserId("");
            setReason("");
            setSuspendDays("7");
            setSearchUsername("");
        } catch (error: any) {
            toast.error(error.message || "Failed to ban/suspend user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnban = async (banId: Id<"bannedUsers">, userId: string) => {
        if (!confirm(`Unban user ${userId}?`) || !user) return;

        try {
            await unbanUser({ banId, adminUserId: user.id });
            toast.success("User unbanned successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to unban user");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <Link href="/admin">
                    <button className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors mb-6">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Dashboard
                    </button>
                </Link>

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Banned & Suspended Users
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Manage user bans and suspensions
                        </p>
                    </div>
                    <button
                        onClick={() => setShowBanDialog(true)}
                        className="h-10 px-4 inline-flex items-center gap-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity"
                    >
                        <Ban className="h-4 w-4" />
                        Ban/Suspend User
                    </button>
                </div>

                {/* Banned Users List */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {bannedUsers && bannedUsers.length > 0 ? (
                            bannedUsers.map((ban: any) => (
                                <div
                                    key={ban._id}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <code className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {ban.userId}
                                                </code>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${ban.type === "ban"
                                                    ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                                                    : "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                                                    }`}>
                                                    {ban.type === "ban" ? "Banned" : "Suspended"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                <span className="font-medium">Reason:</span> {ban.reason}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                {ban.type === "ban" ? "Permanent ban" : `Expires: ${new Date(ban.expiresAt!).toLocaleString()}`}
                                                {" • "}
                                                Banned on {new Date(ban.bannedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleUnban(ban._id, ban.userId)}
                                            className="h-9 px-3 inline-flex items-center gap-2 text-xs font-medium border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
                                        >
                                            <Unlock className="h-3.5 w-3.5" />
                                            Unban
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    No banned or suspended users
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ban/Suspend Dialog */}
                {showBanDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowBanDialog(false)}
                        />
                        <div className="relative w-full max-w-md mx-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Ban or Suspend User
                                </h3>
                            </div>
                            <form onSubmit={handleBanSubmit} className="p-6 space-y-4">
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setBanType("ban")}
                                        className={`flex-1 h-10 px-4 text-sm font-medium rounded-md transition-colors ${banType === "ban"
                                            ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-2 border-red-300 dark:border-red-800"
                                            : "border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                                            }`}
                                    >
                                        <Ban className="h-4 w-4 inline mr-2" />
                                        Permanent Ban
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBanType("suspend")}
                                        className={`flex-1 h-10 px-4 text-sm font-medium rounded-md transition-colors ${banType === "suspend"
                                            ? "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-2 border-orange-300 dark:border-orange-800"
                                            : "border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                                            }`}
                                    >
                                        <Clock className="h-4 w-4 inline mr-2" />
                                        Temporary Suspend
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Search by Username
                                    </label>
                                    <input
                                        type="text"
                                        value={searchUsername}
                                        onChange={(e) => setSearchUsername(e.target.value.toLowerCase())}
                                        placeholder="Type username to search..."
                                        className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                    />
                                    {userSearch && (
                                        <div className="mt-2 p-3 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900">
                                            <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">User Found:</p>
                                            <p className="text-sm text-green-900 dark:text-green-100">Username: {userSearch.username}</p>
                                            <p className="text-xs text-green-700 dark:text-green-300">User ID: {userSearch.userId}</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTargetUserId(userSearch.username);
                                                    setSearchUsername("");
                                                }}
                                                className="mt-2 h-7 px-2 text-xs font-medium bg-green-600 dark:bg-green-700 text-white rounded-md hover:opacity-80"
                                            >
                                                Use this user
                                            </button>
                                        </div>
                                    )}
                                    {searchUsername.length >= 2 && !userSearch && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">No user found with username "{searchUsername}"</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Username or User ID
                                    </label>
                                    <input
                                        type="text"
                                        value={targetUserId}
                                        onChange={(e) => setTargetUserId(e.target.value)}
                                        placeholder="Enter username or user ID"
                                        required
                                        className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Or enter manually if you know the username/ID
                                    </p>
                                </div>

                                {banType === "suspend" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Suspend Duration (days)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={suspendDays}
                                            onChange={(e) => setSuspendDays(e.target.value)}
                                            required
                                            className="w-full h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Reason
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Enter reason for ban/suspension"
                                        rows={3}
                                        required
                                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowBanDialog(false)}
                                        className="flex-1 h-10 px-4 text-sm font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 h-10 px-4 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Processing..." : banType === "ban" ? "Ban User" : "Suspend User"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
