'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Link from 'next/link';
import { Property } from '../../types';
import { mockApi } from '../../lib/api';

export default function PropertyDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        // In a real app, fetch from Supabase
        const fetchProperty = async () => {
            try {
                // Use mockApi for development, in a real app we would use the actual API
                const propertyData = await mockApi.getProperty(id);
                setProperty(propertyData);
            } catch (error) {
                console.error('Error fetching property:', error);
                // Property not found, redirect to home
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-xl">Loading property...</div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Property not found</div>
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
                    <h1 className="text-3xl font-bold">{property.title}</h1>
                    <p className="text-gray-600">{property.location}</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column (2/3 width on large screens) */}
                    <div className="lg:col-span-2">
                        {/* Image gallery */}
                        <section className="mb-8">
                            <div className="bg-gray-200 rounded-lg h-[300px] md:h-[400px] flex items-center justify-center mb-2">
                                {property.images.length > 0 ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-gray-500 text-lg">Property Image {selectedImageIndex + 1}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-500">No images available</span>
                                )}
                            </div>

                            {property.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {property.images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`bg-gray-200 h-16 w-16 flex-shrink-0 rounded ${selectedImageIndex === index ? 'ring-2 ring-[#FF385C]' : ''
                                                }`}
                                        >
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-xs text-gray-500">{index + 1}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Description */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">About this property</h2>
                            <p className="text-gray-700 whitespace-pre-line">
                                {property.description || 'No description available.'}
                            </p>
                        </section>

                        {/* Amenities */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Amenities</h2>

                            {property.amenities.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {property.amenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="h-4 w-4 bg-[#FF385C] rounded-full mr-2"></div>
                                            <span>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">No amenities listed</p>
                            )}
                        </section>

                        {/* Availability */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Availability</h2>

                            {property.availability.length > 0 ? (
                                <ul className="space-y-2">
                                    {property.availability.map((period, index) => (
                                        <li key={index} className="bg-gray-50 p-3 rounded-lg border">
                                            {period}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-600">No availability periods listed</p>
                            )}
                        </section>
                    </div>

                    {/* Right column (1/3 width on large screens) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg border shadow-sm sticky top-8">
                            <h2 className="text-xl font-semibold mb-4">${property.price} <span className="text-gray-600 font-normal">/ night</span></h2>

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
                                    <span>${property.price} x 5 nights</span>
                                    <span>${property.price * 5}</span>
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
                                    <span>${property.price * 5 + 75 + 65}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 