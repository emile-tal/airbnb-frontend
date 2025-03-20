"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Link from "next/link";

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isHosting, setIsHosting] = useState(false);

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

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link
                            href="/"
                            className="flex items-center px-2 py-2 text-gray-900 hover:text-gray-500 hover:cursor-pointer"
                        >
                            Home
                        </Link>
                    </div>
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
            </div>
        </nav>
    );
} 