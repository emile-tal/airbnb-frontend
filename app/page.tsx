'use client';

import { Suspense, lazy, useEffect, useState } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Lazy-loaded components
const ListingsDisplay = lazy(() => import('@/app/components/ListingsDisplay'));
const LoadingSkeleton = () => (
  <div className="flex justify-center py-10">
    <div className="animate-pulse">Loading listings...</div>
  </div>
);

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();

  // Get search parameters to check if filters are applied
  const location = searchParams.get('location');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const guests = searchParams.get('guests');

  // Check if any filters are applied
  const isFiltered = !!(location || (startDate && endDate) || guests);

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
