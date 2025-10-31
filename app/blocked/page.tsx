"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Ban, Clock } from "lucide-react";

export default function BlockedPage() {
    const { user } = useUser();
    const userStatus = useQuery(
        (api as any).bannedUsers?.checkUserStatus,
        user?.id ? { userId: user.id } : "skip"
    );

    if (!userStatus?.isBanned) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Checking account status...
                    </p>
                </div>
            </div>
        );
    }

    const isPermanent = userStatus.type === "ban";
    const expiresAt = userStatus.expiresAt ? new Date(userStatus.expiresAt) : null;

    return (
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-6 ${isPermanent
                    ? "bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-900"
                    : "bg-orange-100 dark:bg-orange-950 border border-orange-200 dark:border-orange-900"
                    }`}>
                    {isPermanent ? (
                        <Ban className="h-8 w-8 text-red-600 dark:text-red-400" />
                    ) : (
                        <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    )}
                </div>

                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {isPermanent ? "Account Banned" : "Account Suspended"}
                </h1>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {isPermanent
                        ? "Your account has been permanently banned from this platform."
                        : `Your account has been temporarily suspended until ${expiresAt?.toLocaleString()}.`}
                </p>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-6">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Reason:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {userStatus.reason}
                    </p>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-500">
                    If you believe this is a mistake, please contact support.
                </p>
            </div>
        </div>
    );
}
