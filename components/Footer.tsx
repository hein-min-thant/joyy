"use client";

import Link from "next/link";
import { BookOpen, Github, Twitter, Mail } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">JOYY</span>
                        </Link>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            Your destination for manga, manhwa, and comics from around the world.
                        </p>
                    </div>

                    {/* Browse */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            Browse
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    All Comics
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/search"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Search
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/library"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    My Library
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/favorites"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Favorites
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            Account
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/profile"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Profile
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/coins"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Get Coins
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/sign-in"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/sign-up"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            Support
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                >
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        © {currentYear} JOYY. All rights reserved.
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        <a
                            href="#"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            aria-label="Twitter"
                        >
                            <Twitter className="h-4 w-4" />
                        </a>
                        <a
                            href="#"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            aria-label="GitHub"
                        >
                            <Github className="h-4 w-4" />
                        </a>
                        <a
                            href="#"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            aria-label="Email"
                        >
                            <Mail className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
