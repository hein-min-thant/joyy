"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookOpen, Coins, Moon, Sun, Heart, Library, Settings, User, Menu, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { NotificationBell } from "@/components/NotificationBell";

export function Navbar() {
    const { user, isSignedIn } = useUser();
    const { theme = "light", toggleTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

                    {/* Right side - Desktop & Mobile */}
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
                                {/* Desktop Navigation */}
                                <div className="hidden md:flex items-center gap-2">
                                    <div className="h-8 w-8 inline-flex items-center justify-center">
                                        <NotificationBell />
                                    </div>

                                    <Link href="/coins">
                                        <button className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md text-sm font-medium border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <Coins className="h-3.5 w-3.5" />
                                            <span className="text-xs">{coinBalance ?? 0}</span>
                                        </button>
                                    </Link>

                                    <Link href="/library">
                                        <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors">
                                            <Library className="h-3.5 w-3.5" />
                                            <span className="text-xs font-medium hidden sm:inline">Library</span>
                                        </button>
                                    </Link>

                                    <Link href="/favorites">
                                        <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors">
                                            <Heart className="h-3.5 w-3.5" />
                                            <span className="text-xs font-medium hidden sm:inline">Favorites</span>
                                        </button>
                                    </Link>

                                    <Link href="/profile">
                                        <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors">
                                            <User className="h-3.5 w-3.5" />
                                            <span className="text-xs font-medium hidden sm:inline">Profile</span>
                                        </button>
                                    </Link>

                                    {isAdmin && (
                                        <Link href="/admin">
                                            <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors">
                                                <Settings className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium hidden sm:inline">Admin</span>
                                            </button>
                                        </Link>
                                    )}

                                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

                                    <div className="flex items-center">
                                        <UserButton />
                                    </div>
                                </div>

                                {/* Mobile: Coins, UserButton, and Hamburger */}
                                <div className="md:hidden flex items-center gap-2">
                                    <Link href="/coins">
                                        <button className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md text-sm font-medium border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                            <Coins className="h-3.5 w-3.5" />
                                            <span className="text-xs">{coinBalance ?? 0}</span>
                                        </button>
                                    </Link>

                                    <div className="flex items-center">
                                        <UserButton />
                                    </div>

                                    <button
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
                                    >
                                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Sign In/Up buttons (always visible) */}
                                <Link href="/sign-in">
                                    <button className="h-8 px-3 inline-flex items-center rounded-md text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white transition-colors">
                                        Sign In
                                    </button>
                                </Link>

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

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
                    <div className="px-4 py-3 space-y-2">
                        {isSignedIn ? (
                            <>
                                <Link href="/library" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900">
                                        <Library className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                        <span className="text-sm text-gray-900 dark:text-gray-100">Library</span>
                                    </div>
                                </Link>
                                <Link href="/favorites" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900">
                                        <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                        <span className="text-sm text-gray-900 dark:text-gray-100">Favorites</span>
                                    </div>
                                </Link>
                                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900">
                                        <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                        <span className="text-sm text-gray-900 dark:text-gray-100">Profile</span>
                                    </div>
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                        <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900">
                                            <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm text-gray-900 dark:text-gray-100">Admin</span>
                                        </div>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md">
                                        Sign In
                                    </div>
                                </Link>
                                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="px-3 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-md text-center">
                                        Sign Up
                                    </div>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
