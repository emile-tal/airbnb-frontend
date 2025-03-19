'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Image from 'next/image';
import Link from 'next/link';
import { Listing } from '../../types';
import { getListing } from '../../lib/api';

export default function ListingDetail() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetchListing = async () => {
            try {
                const listingData = await getListing(id as string);
                setListing(listingData);
            } catch (error) {
                console.error('Error fetching listing:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id, router]);

    if (!isMounted) {
        return null; // Return nothing on initial server render
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-xl">Loading listing...</div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Listing not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-6">
                    <Link href="/" className="text-[#FF385C] hover:underline mb-4 inline-block">
                        &larr; Back to Listings
                    </Link>
                    <h1 className="text-3xl font-bold">{listing.title}</h1>
                    <p className="text-gray-600">{listing.locationValue}</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column (2/3 width on large screens) */}
                    <div className="lg:col-span-2">
                        {/* Image */}
                        <section className="mb-8">
                            <div className="rounded-lg h-[300px] md:h-[400px] relative overflow-hidden">
                                {listing.imageSrc ? (
                                    <Image
                                        src={listing.imageSrc}
                                        alt={listing.title}
                                        fill
                                        priority
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw"
                                        style={{ objectFit: 'cover' }}
                                        className="rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <span className="text-gray-500">No image available</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Description */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">About this listing</h2>
                            <p className="text-gray-700 whitespace-pre-line">
                                {listing.description || 'No description available.'}
                            </p>
                        </section>

                        {/* Details */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Features</h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="flex items-center">
                                    <div className="h-4 w-4 bg-[#FF385C] rounded-full mr-2"></div>
                                    <span>{listing.roomCount} Rooms</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-4 w-4 bg-[#FF385C] rounded-full mr-2"></div>
                                    <span>{listing.bathroomCount} Bathrooms</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-4 w-4 bg-[#FF385C] rounded-full mr-2"></div>
                                    <span>{listing.guestCount} Guests</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-4 w-4 bg-[#FF385C] rounded-full mr-2"></div>
                                    <span>{listing.category}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right column (1/3 width on large screens) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg border shadow-sm sticky top-8">
                            <h2 className="text-xl font-semibold mb-4">${listing.price} <span className="text-gray-600 font-normal">/ night</span></h2>

                            <div className="mb-6">
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div>
                                        <label htmlFor="check-in" className="block text-sm font-medium text-gray-700 mb-1">
                                            Check-in
                                        </label>
                                        <input
                                            id="check-in"
                                            type="date"
                                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="check-out" className="block text-sm font-medium text-gray-700 mb-1">
                                            Check-out
                                        </label>
                                        <input
                                            id="check-out"
                                            type="date"
                                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                                        Guests
                                    </label>
                                    <select
                                        id="guests"
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                    >
                                        <option value="1">1 guest</option>
                                        <option value="2">2 guests</option>
                                        <option value="3">3 guests</option>
                                        <option value="4">4 guests</option>
                                        <option value="5">5+ guests</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                className="w-full bg-[#FF385C] hover:bg-[#E61E4D] text-white font-medium py-3 rounded-md transition-colors"
                            >
                                Reserve
                            </button>

                            <div className="mt-4 border-t pt-4">
                                <div className="flex justify-between mb-2">
                                    <span>${listing.price} x 5 nights</span>
                                    <span>${listing.price * 5}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Cleaning fee</span>
                                    <span>$75</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Service fee</span>
                                    <span>$65</span>
                                </div>
                                <div className="flex justify-between font-bold mt-4 pt-4 border-t">
                                    <span>Total</span>
                                    <span>${listing.price * 5 + 75 + 65}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 