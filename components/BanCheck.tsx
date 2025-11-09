"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname, useRouter } from "next/navigation";

export function BanCheck() {
    const { user } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    // Skip ban check if user is not logged in or API doesn't exist
    const userStatus = useQuery(
        api.bannedUsers.checkUserStatus,
        user?.id ? { userId: user.id } : "skip"
    );

    useEffect(() => {
        // Don't redirect if already on blocked page or sign-in/sign-up
        if (pathname === "/blocked" || pathname?.startsWith("/sign-")) {
            return;
        }

        // Only redirect if we have a definitive ban status
        if (userStatus?.isBanned === true) {
            router.push("/blocked");
        }
    }, [userStatus, pathname, router]);

    return null;
}
