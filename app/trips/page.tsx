"use client";

import { useEffect, useState } from 'react';

import AuthCheck from '@/components/AuthCheck';
import Image from 'next/image';
import Link from 'next/link';
import { Reservation } from '@/app/types';
import { getCurrentUserTrips } from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function TripsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [trips, setTrips] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTrips() {
            if (status === 'authenticated') {
                try {
                    const tripsData = await getCurrentUserTrips();
                    setTrips(tripsData);
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error fetching trips:', error);
                    setError('Failed to load your trips. Please try again later.');
                    setIsLoading(false);
                }
            }
        }

        fetchTrips();
    }, [status]);

    // Group trips by status and date
    const upcomingTrips = trips.filter(
        trip => new Date(trip.startDate) > new Date() && trip.status !== 'rejected'
    );

    const pastTrips = trips.filter(
        trip => new Date(trip.endDate) < new Date() && trip.status !== 'rejected'
    );

    const rejectedTrips = trips.filter(
        trip => trip.status === 'rejected'
    );

    const pendingTrips = trips.filter(
        trip => trip.status === 'pending' && new Date(trip.startDate) > new Date()
    );

    // Format date for display
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Loading trips...</h1>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <AuthCheck>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Your Trips</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-lg">
                        {error}
                    </div>
                )}

                {rejectedTrips.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                        <p className="font-medium">You have {rejectedTrips.length} rejected reservation(s).</p>
                        <ul className="mt-2 list-disc list-inside">
                            {rejectedTrips.map(trip => (
                                <li key={trip.id}>
                                    {trip.listing.title}: {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {pendingTrips.length > 0 && (
                    <div className="mb-6 p-4 bg-yellow-50 text-yellow-700 rounded-lg">
                        <p className="font-medium">You have {pendingTrips.length} pending reservation(s) awaiting host approval.</p>
                    </div>
                )}

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Upcoming Trips</h2>
                    {upcomingTrips.length === 0 ? (
                        <div className="p-6 bg-gray-50 rounded-lg text-gray-500">
                            You don't have any upcoming trips.
                            <div className="mt-4">
                                <Link
                                    href="/listings"
                                    className="text-rose-500 hover:text-rose-600 font-medium"
                                >
                                    Start exploring stays
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingTrips.map(trip => (
                                <div key={trip.id} className="border rounded-lg overflow-hidden shadow-sm">
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={trip.listing.imageSrc || '/placeholder.jpg'}
                                            alt={trip.listing.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-lg mb-1">{trip.listing.title}</h3>
                                        <div className="text-gray-500 mb-2 text-sm">
                                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">${trip.totalPrice}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${trip.status === 'accepted'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {trip.status === 'accepted' ? 'Confirmed' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Past Trips</h2>
                    {pastTrips.length === 0 ? (
                        <div className="p-6 bg-gray-50 rounded-lg text-gray-500">
                            You don't have any past trips.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pastTrips.map(trip => (
                                <div key={trip.id} className="border rounded-lg overflow-hidden shadow-sm">
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={trip.listing.imageSrc || '/placeholder.jpg'}
                                            alt={trip.listing.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-lg mb-1">{trip.listing.title}</h3>
                                        <div className="text-gray-500 mb-2 text-sm">
                                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                        </div>
                                        <div className="font-medium">
                                            ${trip.totalPrice}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthCheck>
    );
} 