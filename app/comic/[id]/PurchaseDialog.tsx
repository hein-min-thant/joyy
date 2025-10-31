"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Coins, X } from "lucide-react";
import { toast } from "sonner";

interface PurchaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    comic: {
        _id: Id<"comics">;
        title: string;
        price: number;
    };
    onSuccess: () => void;
}

export function PurchaseDialog({ open, onOpenChange, comic, onSuccess }: PurchaseDialogProps) {
    const { user } = useUser();
    const [purchasing, setPurchasing] = useState(false);
    const purchase = useMutation(api.purchases.purchase);
    const coinBalance = useQuery(
        api.wallets.getBalance,
        user?.id ? { userId: user.id } : "skip"
    );

    const handlePurchase = async () => {
        if (!user) return;

        setPurchasing(true);
        try {
            await purchase({ userId: user.id, comicId: comic._id });
            toast.success("Purchase successful! You can now read this comic.");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setPurchasing(false);
        }
    };

    const hasEnoughCoins = (coinBalance ?? 0) >= comic.price;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-md mx-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Confirm Purchase
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {comic.title}
                        </p>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Current Balance */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Your Balance
                        </span>
                        <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {coinBalance ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Price
                        </span>
                        <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {comic.price}
                            </span>
                        </div>
                    </div>

                    {/* After Purchase */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            After Purchase
                        </span>
                        <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-base font-semibold text-blue-900 dark:text-blue-100">
                                {(coinBalance ?? 0) - comic.price}
                            </span>
                        </div>
                    </div>

                    {/* Insufficient Coins Warning */}
                    {!hasEnoughCoins && (
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                Insufficient coins. Please contact an admin for a top-up.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => onOpenChange(false)}
                        disabled={purchasing}
                        className="flex-1 h-10 px-4 inline-flex items-center justify-center text-sm font-medium border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePurchase}
                        disabled={purchasing || !hasEnoughCoins}
                        className="flex-1 h-10 px-4 inline-flex items-center justify-center text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {purchasing ? "Processing..." : "Confirm Purchase"}
                    </button>
                </div>
            </div>
        </div>
    );
}
