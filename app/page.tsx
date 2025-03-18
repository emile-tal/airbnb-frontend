'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { Listing } from './types';
import { getListings } from './lib/api';

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchListings() {
      try {
        const data = await getListings();
        setListings(data);
      } catch (err) {
        console.error('Failed to fetch listings:', err);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  if (!isMounted) {
    return null; // Return nothing during server-side rendering
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Vibe Rentals</h1>
        <p className="text-center text-gray-600 mt-2">Find your perfect getaway</p>

        <div className="mt-6 flex justify-center">
          <Link
            href="/add-listing"
            className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-6 py-2 rounded-full font-medium"
          >
            List Your Home
          </Link>
        </div>
      </header>

      <main>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Featured Listings</h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-pulse">Loading listings...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-500 text-center">
              {error}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Link href={`/listing/${listing.id}`} key={listing.id}>
                  <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-48 w-full">
                      {listing.imageSrc ? (
                        <Image
                          src={listing.imageSrc}
                          alt={listing.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: 'cover' }}
                          className="bg-gray-100"
                        />
                      ) : (
                        <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                      <p className="text-gray-600">{listing.locationValue}</p>
                      <p className="font-medium mt-2">${listing.price} / night</p>

                      <div className="mt-3">
                        <h4 className="text-sm font-medium">Features:</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {listing.roomCount} Rooms
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {listing.bathroomCount} Bathrooms
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {listing.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p>No listings found. Be the first to list your home!</p>
              <Link
                href="/add-listing"
                className="inline-block mt-4 bg-[#FF385C] hover:bg-[#E61E4D] text-white px-6 py-2 rounded-full font-medium"
              >
                Add Your Listing
              </Link>
            </div>
          )}
        </section>

        <section>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold mb-2">Have a place to rent?</h2>
            <p className="text-gray-600 mb-4">Share your space and start earning</p>
            <Link
              href="/add-listing"
              className="inline-block bg-[#FF385C] hover:bg-[#E61E4D] text-white px-6 py-2 rounded-full font-medium"
            >
              Become a Host
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
