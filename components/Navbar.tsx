"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isHosting, setIsHosting] = useState(false);

    const shouldShowSearchBar = !pathname?.includes('/not-found') && pathname !== '/404';

    useEffect(() => {
        // Check if the current path is in the hosting section
        setIsHosting(pathname?.startsWith('/dashboard') || false);
    }, [pathname]);

    const handleSwitchMode = () => {
        if (isHosting) {
            router.push('/'); // Go to homepage (guest mode)
        } else {
            router.push('/dashboard'); // Go to dashboard (host mode)
        }
        setIsHosting(!isHosting);
    };

    const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // If we're already on the home page, prevent default navigation and just push to "/"
        // This ensures all query parameters are cleared
        if (pathname === '/') {
            e.preventDefault();
            router.push('/');
        }
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top level - Logo and Navigation */}
                <div className="flex justify-between items-center h-16">
                    {/* Left side: Logo */}
                    <div className="flex-shrink-0">
                        <Link
                            href="/"
                            className="flex items-center text-2xl font-bold text-[#FF385C] hover:cursor-pointer"
                            onClick={handleHomeClick}
                        >
                            VibeBNB
                        </Link>
                    </div>

                    {/* Right side: Navigation */}
                    <div className="flex items-center">
                        {session ? (
                            <div className="flex items-center space-x-4">
                                {!isHosting && (
                                    <Link
                                        href="/trips"
                                        className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-500 transition-colors hover:cursor-pointer"
                                    >
                                        My Trips
                                    </Link>
                                )}

                                <button
                                    onClick={handleSwitchMode}
                                    className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-500 border border-gray-300 rounded-full transition-colors hover:cursor-pointer"
                                >
                                    {isHosting ? "Switch to traveling" : "Switch to hosting"}
                                </button>

                                {isHosting && (
                                    <Link
                                        href="/add-listing"
                                        className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 transition-colors hover:cursor-pointer"
                                    >
                                        Add Listing
                                    </Link>
                                )}

                                <button
                                    onClick={() => signOut()}
                                    className="px-4 py-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors hover:cursor-pointer"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors hover:cursor-pointer"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 transition-colors hover:cursor-pointer"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom level - Centered Search Bar */}
                {shouldShowSearchBar && !isHosting && (
                    <div className="flex justify-center py-4">
                        <div className="w-full max-w-3xl">
                            <SearchBar />
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
} 