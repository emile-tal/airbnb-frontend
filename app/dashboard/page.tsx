"use client";

import { Suspense, lazy, useEffect } from "react";

import Link from "next/link";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Lazy-loaded components
const DashboardContent = dynamic(() => import("@/app/components/DashboardContent"), {
    loading: () => <LoadingSkeleton />
});
const LoadingSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Loading dashboard...</h1>
        <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
        </div>
    </div>
);

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Show loading skeleton during authentication check
    if (status === "loading") {
        return <LoadingSkeleton />;
    }

    // Show "Access Denied" if not authenticated
    if (status === "unauthenticated") {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="p-6 bg-red-50 rounded-lg text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
                    <p className="mb-4">You need to be logged in to view this page.</p>
                    <Link
                        href="/login"
                        className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Your Dashboard</h1>

            <Suspense fallback={<LoadingSkeleton />}>
                <DashboardContent />
            </Suspense>

            <div className="mt-8 pt-4 border-t text-sm text-gray-500">
                <p>Having trouble with your dashboard? <Link href="/dashboard/debug" className="text-blue-500 underline">Try our debug tool</Link></p>
            </div>
        </div>
    );
} 