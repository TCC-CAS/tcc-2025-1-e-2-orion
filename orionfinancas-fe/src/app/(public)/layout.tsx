'use client';

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header/Header";
import { useUser } from "@/contexts/UserContext";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const shouldRedirectToFinances = pathname === "/";
        if (!loading && user && shouldRedirectToFinances) {
            router.replace('/finances');
        }
    }, [loading, user, pathname, router]);

    return (
        <>
            <Header
                variant={user ? "logged" : "public"}
                userData={user}
                isPremium={user?.isPremium}
            />
            {children}
        </>
    );
}
