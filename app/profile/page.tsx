"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Copy, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardBody, Button } from "@heroui/react";
import { Input } from "postcss";

export default function ProfilePage() {
    const { user, isSignedIn } = useUser();

    const profile = useQuery(api.userProfiles.get, user?.id ? { userId: user.id } : "skip");
    const username = useQuery(api.wallets.getUsername, user?.id ? { userId: user.id } : "skip");

    const createProfile = useMutation(api.userProfiles.create);
    const updateProfile = useMutation(api.userProfiles.update);
    const setUsernameMutation = useMutation(api.wallets.setUsername);

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [usernameError, setUsernameError] = useState("");

    // Check username availability
    const usernameCheck = useQuery(
        api.wallets.getUserByUsername,
        newUsername.length >= 5 && isEditingUsername ? { username: newUsername } : "skip"
    );

    // Check if username is reserved
    const isReserved = useQuery(
        api.reservedUsernames.isReserved,
        newUsername.length >= 5 && isEditingUsername ? { username: newUsername } : "skip"
    );

    useEffect(() => {
        if (user && !profile) {
            createProfile({
                userId: user.id,
                displayName: user.fullName || "User"
            });
        }
    }, [user, profile, createProfile]);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName);
        } else if (user?.fullName) {
            // Initialize with Gmail name if no profile yet
            setDisplayName(user.fullName);
        }
    }, [profile, user]);

    useEffect(() => {
        if (username) {
            setNewUsername(username);
        }
    }, [username]);

    // Check username availability as user types
    useEffect(() => {
        if (!isEditingUsername) {
            setUsernameError("");
            return;
        }

        if (newUsername.length < 5) {
            setUsernameError("Username must be at least 5 characters");
            return;
        }

        if (isReserved) {
            setUsernameError("Username is reserved");
            return;
        }

        if (usernameCheck && usernameCheck.userId !== user?.id) {
            setUsernameError("Username already taken");
        } else if (usernameCheck && usernameCheck.userId === user?.id) {
            setUsernameError(""); // Current username
        } else if (newUsername.length >= 5) {
            setUsernameError(""); // Available
        }
    }, [newUsername, usernameCheck, isReserved, isEditingUsername, user]);

    if (!isSignedIn || !user) {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        Please sign in to view your profile
                    </p>
                </div>
            </div>
        );
    }

    const handleSaveName = async () => {
        if (!displayName.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile({ userId: user.id, displayName: displayName.trim() });
            toast.success("Name updated");
            setIsEditingName(false);
        } catch (error) {
            toast.error("Failed to update name");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveUsername = async () => {
        if (!newUsername.trim()) {
            toast.error("Username cannot be empty");
            return;
        }

        if (newUsername.length < 5) {
            toast.error("Username must be at least 5 characters");
            return;
        }

        if (usernameError) {
            toast.error(usernameError);
            return;
        }

        setIsSaving(true);
        try {
            await setUsernameMutation({ userId: user.id, username: newUsername.trim() });
            toast.success("Username updated");
            setIsEditingUsername(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update username");
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Profile
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage your account information
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Name (Editable) */}
                    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Name
                            </label>
                            {!isEditingName && (
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        {isEditingName ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="flex-1 h-10 px-3 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100"
                                />
                                <button
                                    onClick={handleSaveName}
                                    disabled={isSaving}
                                    className="h-10 w-10 inline-flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingName(false);
                                        setDisplayName(profile?.displayName || user?.fullName || "");
                                    }}
                                    className="h-10 w-10 inline-flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-base text-gray-900 dark:text-gray-100">
                                {profile?.displayName || user?.fullName || "Not set"}
                            </p>
                        )}
                    </div>

                    {/* Username */}
                    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Username
                            </label>
                            {username && !isEditingUsername && (
                                <button
                                    onClick={() => setIsEditingUsername(true)}
                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        {isEditingUsername || !username ? (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            placeholder="Choose a username (min 5 chars)"
                                            minLength={5}
                                            className={`w-full h-10 px-3 text-sm border rounded-md bg-white dark:bg-black text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${usernameError
                                                ? "border-red-300 dark:border-red-800 focus:ring-red-500"
                                                : newUsername.length >= 5 && !usernameCheck
                                                    ? "border-green-300 dark:border-green-800 focus:ring-green-500"
                                                    : "border-gray-200 dark:border-gray-800 focus:ring-gray-900 dark:focus:ring-gray-100"
                                                }`}
                                        />
                                        {newUsername.length > 0 && (
                                            <p className={`text-xs mt-1 ${usernameError
                                                ? "text-red-600 dark:text-red-400"
                                                : newUsername.length >= 5 && !usernameCheck
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-gray-500"
                                                }`}>
                                                {usernameError || (newUsername.length >= 5 && !usernameCheck ? "✓ Available" : `${newUsername.length}/5 characters`)}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleSaveUsername}
                                        disabled={isSaving || !!usernameError || newUsername.length < 5}
                                        className="h-10 w-10 inline-flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                    {username && (
                                        <button
                                            onClick={() => {
                                                setIsEditingUsername(false);
                                                setNewUsername(username);
                                                setUsernameError("");
                                            }}
                                            className="h-10 w-10 inline-flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Share your username with admins for coin top-ups
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-gray-900 dark:text-gray-100">
                                        {username}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(username, "Username")}
                                        className="h-10 w-10 inline-flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Share your username with admins for coin top-ups
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                            Email
                        </label>
                        <p className="text-base text-gray-900 dark:text-gray-100">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>

                    {/* User ID */}
                    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                            User ID
                        </label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-gray-900 dark:text-gray-100 break-all font-mono">
                                {user.id}
                            </code>
                            <button
                                onClick={() => copyToClipboard(user.id, "User ID")}
                                className="h-10 w-10 inline-flex items-center justify-center border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    {profile && (
                        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                Statistics
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Comics Read
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                        {profile.totalRead}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Reviews Written
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                        {profile.totalReviews}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
