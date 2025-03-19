'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Listing } from '@/app/types';
import { getListings } from '@/app/lib/api';

const ErrorDisplay = ({ error }: { error: string }) => (
    <div className="bg-red-50 p-4 rounded-lg text-red-500 text-center">
        {error}
    </div>
);

const EmptyListingsDisplay = () => (
    <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p>No listings found. Be the first to list your home!</p>
        <Link
            href="/add-listing"
            className="inline-block mt-4 bg-[#FF385C] hover:bg-[#E61E4D] text-white px-6 py-2 rounded-full font-medium"
        >
            Add Your Listing
        </Link>
    </div>
);

export default function ListingsDisplay() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        async function fetchListings() {
            if (isLoaded) return; // Prevent refetching

            try {
                setError(null);
                const data = await getListings();
                setListings(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch listings:', err);
                let errorMessage = 'Failed to load listings. Please try again later.';
                if (err && typeof err === 'object' && 'message' in err) {
                    errorMessage = `Error: ${err.message}`;
                }
                setError(errorMessage);
            } finally {
                setIsLoaded(true);
            }
        }

        fetchListings();
    }, [isLoaded]);

    if (error) {
        return <ErrorDisplay error={error} />;
    }

    if (!isLoaded) {
        // This should not be visible since parent Suspense handles loading
        return null;
    }

    if (listings.length === 0) {
        return <EmptyListingsDisplay />;
    }

    return (
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
    );
} 