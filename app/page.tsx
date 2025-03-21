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

// Client component to handle search params
function HomeContent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Return nothing during server-side rendering
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <main>
        <section className="mb-8">
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

// Main component with Suspense
export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
