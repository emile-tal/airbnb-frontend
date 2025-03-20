'use client';

import { Listing, Reservation } from '@/app/types';
import { getUserListings, updateReservationStatus } from '@/app/lib/api';
import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

interface ErrorDisplayProps {
    error: string;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
    <div className="mb-6 bg-red-50 p-4 rounded-lg text-red-500">
        {error}
        <div className="mt-2">
            <Link href="/dashboard/debug" className="text-blue-500 underline">
                Debug Authentication Issues
            </Link>
        </div>
    </div>
);

export default function DashboardContent() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded) return; // Prevent duplicate fetching

        async function fetchDashboardData() {
            try {
                console.log("Dashboard: Starting to fetch user listings");
                setError(null);

                // Fetch user's listings using the API client
                const listingsData = await getUserListings();
                console.log("Dashboard: Received listings data:", listingsData);
                setListings(Array.isArray(listingsData) ? listingsData : []);

                // Fetch reservations for all user listings
                if (listingsData && Array.isArray(listingsData) && listingsData.length > 0) {
                    console.log(`Dashboard: Fetching reservations for ${listingsData.length} listings`);
                    const listingIds = listingsData.map((listing) => listing.id);
                    const response = await fetch("/api/reservations/host", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ listingIds }),
                    });

                    if (!response.ok) {
                        console.error("Dashboard: Error response from reservations API:", response.status);
                        throw new Error(`Failed to fetch reservations: ${response.status}`);
                    }

                    const reservationsData = await response.json();
                    console.log("Dashboard: Received reservations data:", reservationsData);
                    const reservationsArray = Array.isArray(reservationsData) ? reservationsData : [];
                    setReservations(reservationsArray);
                } else {
                    console.log("Dashboard: No listings found, skipping reservation fetch");
                    setReservations([]);
                }
            } catch (error) {
                console.error("Dashboard: Error fetching dashboard data:", error);
                let errorMessage = "Failed to load dashboard data. Please try again later.";
                if (error instanceof Error) {
                    errorMessage = `Error: ${error.message}`;
                }
                setError(errorMessage);
            } finally {
                setIsLoaded(true);
            }
        }

        fetchDashboardData();
    }, [isLoaded]);

    const handleDeleteListing = async (listingId: string) => {
        if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
            try {
                const response = await fetch(`/api/listings/${listingId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    setListings(listings.filter((listing) => listing.id !== listingId));
                    // Also filter out reservations for the deleted listing
                    setReservations(reservations.filter(reservation => reservation.listingId !== listingId));
                } else {
                    alert("Error deleting listing.");
                }
            } catch (error) {
                console.error("Error deleting listing:", error);
                alert("Error deleting listing. Please try again.");
            }
        }
    };

    // Update reservation status
    const handleReservationStatusUpdate = async (reservationId: string, status: 'accepted' | 'rejected') => {
        setIsUpdating(reservationId);
        setUpdateSuccess(null);
        try {
            await updateReservationStatus(reservationId, status);

            // Update local state
            setReservations(prevReservations =>
                prevReservations.map(res =>
                    res.id === reservationId ? { ...res, status } : res
                )
            );

            setUpdateSuccess(`Reservation ${status === 'accepted' ? 'accepted' : 'rejected'} successfully`);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setUpdateSuccess(null);
            }, 3000);
        } catch (error) {
            console.error(`Error updating reservation status:`, error);
            setError(`Failed to ${status} reservation. Please try again.`);
        } finally {
            setIsUpdating(null);
        }
    };

    // Helper to format date
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (error) {
        return <ErrorDisplay error={error} />;
    }

    return (
        <>
            {updateSuccess && (
                <div className="mb-6 bg-green-50 p-4 rounded-lg text-green-600">
                    {updateSuccess}
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Your Listings</h2>
                {!listings || listings.length === 0 ? (
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                        <p className="text-gray-600 mb-4">You don&apos;t have any listings yet.</p>
                        <Link
                            href="/add-listing"
                            className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
                        >
                            Create Your First Listing
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing) => (
                            <div key={listing.id} className="border rounded-lg overflow-hidden shadow-sm">
                                <div className="relative h-48 w-full">
                                    {listing.imageSrc ? (
                                        <Image
                                            src={listing.imageSrc}
                                            alt={listing.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                                            <span className="text-gray-500">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-medium mb-2">{listing.title}</h3>
                                    <p className="text-gray-500 mb-2">${listing.price} / night</p>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <Link
                                            href={`/listing/${listing.id}`}
                                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm transition-colors"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/listing/${listing.id}/edit`}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            href={`/listing/${listing.id}/availability`}
                                            className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm transition-colors"
                                        >
                                            Manage Availability
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteListing(listing.id)}
                                            className="px-3 py-1 bg-rose-100 text-rose-800 rounded-md hover:bg-rose-200 text-sm transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Reservations for Your Properties</h2>
                {(!reservations || reservations.length === 0) ? (
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <p className="text-gray-600">You don&apos;t have any reservations yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border p-2 text-left">Property</th>
                                    <th className="border p-2 text-left">Guest</th>
                                    <th className="border p-2 text-left">Check-in</th>
                                    <th className="border p-2 text-left">Check-out</th>
                                    <th className="border p-2 text-left">Total</th>
                                    <th className="border p-2 text-left">Status</th>
                                    <th className="border p-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((reservation) => {
                                    const listing = listings.find((l) => l.id === reservation.listingId);
                                    // Determine if this reservation is in the future
                                    const now = new Date();
                                    const startDate = new Date(reservation.startDate);
                                    const endDate = new Date(reservation.endDate);
                                    let status = "Unknown";

                                    if (endDate < now) {
                                        status = "Completed";
                                    } else if (startDate <= now && endDate >= now) {
                                        status = "Active";
                                    } else {
                                        status = "Upcoming";
                                    }

                                    return (
                                        <tr key={reservation.id}>
                                            <td className="border p-2">{listing?.title || "Unknown property"}</td>
                                            <td className="border p-2">Guest #{reservation.userId.slice(0, 6)}</td>
                                            <td className="border p-2">{formatDate(reservation.startDate)}</td>
                                            <td className="border p-2">{formatDate(reservation.endDate)}</td>
                                            <td className="border p-2">${reservation.totalPrice}</td>
                                            <td className="border p-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${reservation.status === 'rejected'
                                                        ? 'bg-red-100 text-red-800'
                                                        : reservation.status === 'accepted'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="border p-2">
                                                {reservation.status === 'pending' && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleReservationStatusUpdate(reservation.id, 'accepted')}
                                                            disabled={isUpdating === reservation.id}
                                                            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                                                        >
                                                            {isUpdating === reservation.id ? 'Processing...' : 'Accept'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleReservationStatusUpdate(reservation.id, 'rejected')}
                                                            disabled={isUpdating === reservation.id}
                                                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                                                        >
                                                            {isUpdating === reservation.id ? 'Processing...' : 'Reject'}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
} 