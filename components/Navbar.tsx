"use client";

import { signOut, useSession } from "next-auth/react";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();

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
                                    href="/listings/create"
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