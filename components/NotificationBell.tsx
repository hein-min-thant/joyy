"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationBell() {
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const notifications = useQuery(
        api.notifications.getUserNotifications,
        user?.id ? { userId: user.id, limit: 5 } : "skip"
    );
    const unreadCount = useQuery(
        api.notifications.getUnreadCount,
        user?.id ? { userId: user.id } : "skip"
    );
    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [open]);

    if (!user) return null;

    const handleNotificationClick = async (notificationId: string) => {
        await markAsRead({ notificationId: notificationId as any });
        setOpen(false);
    };

    const handleMarkAllRead = async () => {
        if (user) {
            await markAllAsRead({ userId: user.id });
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-4 w-4" />
                {unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[9px] font-medium bg-red-500 text-white rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Notifications
                        </h3>
                        {unreadCount && unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications && notifications.length > 0 ? (
                            notifications.map((notif, index) => (
                                <div key={notif._id}>
                                    <div
                                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${!notif.read ? "bg-gray-50 dark:bg-gray-900" : ""
                                            }`}
                                        onClick={() => handleNotificationClick(notif._id)}
                                    >
                                        {notif.link ? (
                                            <Link href={notif.link} className="block">
                                                <div className="flex items-start gap-2">
                                                    {!notif.read && (
                                                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-0.5">
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
                                                            {new Date(notif.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="flex items-start gap-2">
                                                {!notif.read && (
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-0.5">
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
                                                        {new Date(notif.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {index < notifications.length - 1 && (
                                        <div className="border-b border-gray-100 dark:border-gray-900" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-12 text-center">
                                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    No notifications
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
