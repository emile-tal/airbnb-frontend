"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { data: session } = useSession();
    const _router = useRouter();
    const [hasListings, setHasListings] = useState(false);
    const [isCheckingListings, setIsCheckingListings] = useState(false);

    useEffect(() => {
        if (session) {
            setIsCheckingListings(true);
            // Check if user has listings
            fetch("/api/listings/user/check")
                .then((res) => {
                    if (!res.ok) {
                        throw new Error("Failed to check listings");
                    }
                    return res.json();
                })
                .then((data) => {
                    setHasListings(data.hasListings);
                    setIsCheckingListings(false);
                })
                .catch((error) => {
                    console.error("Error checking user listings:", error);
                    setIsCheckingListings(false);
                    // Default to showing the dashboard link if we can't check
                    // This way users don't lose access to their dashboard if the check fails
                    setHasListings(true);
                });
        }
    }, [session]);

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link
                            href="/"
                            className="flex items-center px-2 py-2 text-gray-900 hover:text-gray-500"
                        >
                            Home
                        </Link>
                        <Link
                            href="/listings"
                            className="flex items-center px-2 py-2 text-gray-900 hover:text-gray-500"
                        >
                            Listings
                        </Link>
                    </div>
                    <div className="flex items-center">
                        {session ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/trips"
                                    className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-500 transition-colors"
                                >
                                    Trips
                                </Link>
                                {(hasListings || isCheckingListings) && (
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-500 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <Link
                                    href="/add-listing"
                                    className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 transition-colors"
                                >
                                    Create Listing
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="px-4 py-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 transition-colors"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 