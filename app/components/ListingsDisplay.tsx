'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { Listing } from '@/app/types';
import { getListings } from '@/app/lib/api';
import { useSearchParams } from 'next/navigation';

const ErrorDisplay = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
    <div className="bg-red-50 p-4 rounded-lg text-red-500 text-center">
        <p className="mb-2">{error}</p>
        <button
            onClick={onRetry}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
        >
            Try Again
        </button>
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
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Get search parameters
    const location = searchParams.get('location');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const guests = searchParams.get('guests');

    async function fetchListings() {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getListings();
            setListings(Array.isArray(data) ? data : []);
            setIsLoaded(true);
        } catch (err) {
            console.error('Failed to fetch listings:', err);
            let errorMessage = 'Failed to load listings. Please try again later.';
            if (err && typeof err === 'object' && 'message' in err) {
                errorMessage = `Error: ${err.message}`;
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchListings();
    }, []);

    // Filter listings based on search parameters
    useEffect(() => {
        if (listings.length === 0) return;

        let filtered = [...listings];

        // Filter by location (case insensitive)
        if (location) {
            filtered = filtered.filter(listing =>
                listing.locationValue.toLowerCase().includes(location.toLowerCase()) ||
                listing.title.toLowerCase().includes(location.toLowerCase())
            );
        }

        // Filter by number of guests
        if (guests) {
            const guestCount = parseInt(guests, 10);
            if (!isNaN(guestCount)) {
                filtered = filtered.filter(listing => listing.guestCount >= guestCount);
            }
        }

        // Note: Date filtering would typically be done server-side with reservation data
        // This is a simplified client-side implementation 
        if (startDate && endDate) {
            // For this implementation, we're just keeping all listings
            // In a real app, we would check availability for each listing
            // against the reservation dates
        }

        setFilteredListings(filtered);
    }, [listings, location, startDate, endDate, guests]);

    if (error) {
        return <ErrorDisplay error={error} onRetry={fetchListings} />;
    }

    if (isLoading && !isLoaded) {
        return (
            <div className="w-full py-12">
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="border rounded-lg overflow-hidden shadow-sm h-80">
                            <div className="h-48 bg-gray-200 w-full"></div>
                            <div className="p-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const displayListings = filteredListings.length > 0 ? filteredListings : listings;

    if (displayListings.length === 0) {
        return <EmptyListingsDisplay />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayListings.map((listing) => (
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
                                        {listing.guestCount} Guests
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