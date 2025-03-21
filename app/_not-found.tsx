'use client';

import { Suspense } from 'react';
import Link from 'next/link';

// Create a client component that never uses useSearchParams
function NotFoundContent() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <h2 className="text-2xl font-medium text-gray-600 mb-6">Page Not Found</h2>
            <p className="text-gray-500 max-w-md mb-8">
                We couldn't find the page you're looking for. The page might have been removed,
                renamed, or is temporarily unavailable.
            </p>
            <Link
                href="/"
                className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
                Return Home
            </Link>
        </div>
    );
}

export default function NotFound() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NotFoundContent />
        </Suspense>
    );
} 