"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookOpen, Coins, Moon, Sun, Heart, Library, Settings, Bell, User } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { NotificationBell } from "@/components/NotificationBell";

export function Navbar() {
    const { user, isSignedIn } = useUser();
    const { theme = "light", toggleTheme } = useTheme();
    const isAdmin = useQuery(
        api.admins.isAdmin,
        user?.id ? { userId: user.id } : "skip"
    );
    const coinBalance = useQuery(
        api.wallets.getBalance,
        user?.id ? { userId: user.id } : "skip"
    );

    return (
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-base font-semibold text-black dark:text-white hover:opacity-60 transition-opacity"
                    >
                        <BookOpen className="h-5 w-5" />
                        <span>JOYY</span>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </button>

                        {isSignedIn ? (
                            <>
                                {/* Notification Bell */}
                                <div className="h-8 w-8 inline-flex items-center justify-center">
                                    <NotificationBell />
                                </div>

                                {/* Coins */}
                                <Link href="/coins">
                                    <button className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md text-sm font-medium border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <Coins className="h-3.5 w-3.5" />
                                        <span className="text-xs">{coinBalance ?? 0}</span>
                                    </button>
                                </Link>

                                {/* Library */}
                                <Link href="/library">
                                    <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors">
                                        <Library className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium hidden sm:inline">Library</span>
                                    </button>
                                </Link>

                                {/* Favorites */}
                                <Link href="/favorites">
                                    <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors">
                                        <Heart className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium hidden sm:inline">Favorites</span>
                                    </button>
                                </Link>

                                {/* Profile */}
                                <Link href="/profile">
                                    <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium hidden sm:inline">Profile</span>
                                    </button>
                                </Link>

                                {/* Admin */}
                                {isAdmin && (
                                    <Link href="/admin">
                                        <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors">
                                            <Settings className="h-3.5 w-3.5" />
                                            <span className="text-xs font-medium hidden sm:inline">Admin</span>
                                        </button>
                                    </Link>
                                )}

                                {/* Divider */}
                                <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

                                {/* User Button */}
                                <div className="flex items-center">
                                    <UserButton />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Sign In */}
                                <Link href="/sign-in">
                                    <button className="h-8 px-3 inline-flex items-center rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors">
                                        Sign In
                                    </button>
                                </Link>

                                {/* Sign Up */}
                                <Link href="/sign-up">
                                    <button className="h-8 px-3 inline-flex items-center rounded-md text-xs font-medium bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity">
                                        Sign Up
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
