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

    const userStatus = useQuery(
        (api as any).bannedUsers?.checkUserStatus,
        user?.id ? { userId: user.id } : "skip"
    );

    useEffect(() => {
        // Don't redirect if already on blocked page or sign-in/sign-up
        if (pathname === "/blocked" || pathname?.startsWith("/sign-")) {
            return;
        }

        if (userStatus?.isBanned) {
            router.push("/blocked");
        }
    }, [userStatus, pathname, router]);

    return null;
}
