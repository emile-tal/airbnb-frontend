'use client';

import { Suspense, lazy, useEffect, useState } from 'react';

import Link from 'next/link';

// Lazy-loaded components
const ListingsDisplay = lazy(() => import('@/app/components/ListingsDisplay'));
const LoadingSkeleton = () => (
  <div className="flex justify-center py-10">
    <div className="animate-pulse">Loading listings...</div>
  </div>
);

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Return nothing during server-side rendering
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Vibe Rentals</h1>
        <p className="text-center text-gray-600 mt-2">Find your perfect getaway</p>
      </header>

      <main>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Featured Listings</h2>

          <Suspense fallback={<LoadingSkeleton />}>
            <ListingsDisplay />
          </Suspense>
        </section>

        <section>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Plan Your Next Trip</h2>
            <p className="text-gray-600 mb-4">Explore our listings and book your dream vacation</p>
            <Link
              href="/trips"
              className="inline-block bg-[#FF385C] hover:bg-[#E61E4D] text-white px-6 py-2 rounded-full font-medium hover:cursor-pointer"
            >
              View My Trips
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
