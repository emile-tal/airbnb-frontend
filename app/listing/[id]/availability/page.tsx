"use client";

import { Listing, Reservation } from "@/app/types";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ManageAvailability() {
    const params = useParams();
    const id = params.id as string;

    const { data: session, status } = useSession();
    const router = useRouter();
    const [listing, setListing] = useState<Listing | null>(null);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // This is a simplified version of availability management
    // A complete implementation would include a date picker and more complex availability rules
    const [_blockedDates, setBlockedDates] = useState<Date[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        const fetchListingAndReservations = async () => {
            try {
                // Fetch the listing
                const res = await fetch(`/api/listings/${id}`);

                if (!res.ok) {
                    throw new Error("Failed to fetch listing");
                }

                const data = await res.json();

                // Check if the listing belongs to the user
                if (session?.user?.email) {
                    const userRes = await fetch("/api/users/me");
                    const userData = await userRes.json();

                    if (userData.id !== data.userId) {
                        router.push("/dashboard");
                        return;
                    }
                }

                setListing(data);

                // Fetch existing reservations for this listing
                const reservationsRes = await fetch(`/api/reservations/listing/${id}`);
                const reservationsData = await reservationsRes.json();
                setReservations(reservationsData);

                // In a real implementation, you would also fetch blocked dates from the backend
                // For now, we'll just extract dates from reservations
                const bookedDates: Date[] = [];
                reservationsData.forEach((reservation: Reservation) => {
                    const start = new Date(reservation.startDate);
                    const end = new Date(reservation.endDate);

                    const current = new Date(start);
                    while (current <= end) {
                        bookedDates.push(new Date(current));
                        current.setDate(current.getDate() + 1);
                    }
                });

                setBlockedDates(bookedDates);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load listing details");
            } finally {
                setIsLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchListingAndReservations();
        }
    }, [id, router, session, status]);

    const _handleDateSelect = (date: Date) => {
        // This is a simplified implementation
        // In a real app, you would use a proper date picker library
        if (!startDate) {
            setStartDate(date);
        } else if (!endDate && date > startDate) {
            setEndDate(date);
        } else {
            setStartDate(date);
            setEndDate(null);
        }
    };

    const handleBlockDates = async () => {
        if (!startDate || !endDate) {
            setError("Please select both start and end dates");
            return;
        }

        // Here you would call an API to block these dates
        // This is just a placeholder for the actual implementation
        alert(`Dates blocked from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);

        // In a real implementation, you would refresh the data after blocking dates
        // And add the blocked dates to the blockedDates state
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Loading...</h1>
            </div>
        );
    }

    if (error && !listing) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 p-4 rounded-md mb-6">
                    <p className="text-red-500">{error}</p>
                </div>
                <Link
                    href="/dashboard"
                    className="text-blue-500 hover:underline"
                >
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">Manage Availability</h1>
                <h2 className="text-lg text-gray-600 mb-6">{listing?.title}</h2>

                {error && (
                    <div className="bg-red-50 p-4 rounded-md mb-6">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}

                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Current Reservations</h3>
                    {reservations.length === 0 ? (
                        <p className="text-gray-500">No reservations yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border p-2 text-left">Guest</th>
                                        <th className="border p-2 text-left">Check-in</th>
                                        <th className="border p-2 text-left">Check-out</th>
                                        <th className="border p-2 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map((reservation) => {
                                        const startDate = new Date(reservation.startDate);
                                        const endDate = new Date(reservation.endDate);
                                        const now = new Date();

                                        let status = "Upcoming";
                                        if (endDate < now) status = "Completed";
                                        else if (startDate <= now && endDate >= now) status = "Active";

                                        return (
                                            <tr key={reservation.id} className="hover:bg-gray-50">
                                                <td className="border p-2">
                                                    Guest ID: {reservation.userId.substring(0, 8)}...
                                                </td>
                                                <td className="border p-2">
                                                    {startDate.toLocaleDateString()}
                                                </td>
                                                <td className="border p-2">
                                                    {endDate.toLocaleDateString()}
                                                </td>
                                                <td className="border p-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${status === "Completed" ? "bg-gray-100 text-gray-800" :
                                                        status === "Active" ? "bg-green-100 text-green-800" :
                                                            "bg-blue-100 text-blue-800"
                                                        }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Block Dates</h3>
                    <p className="text-gray-600 mb-4">
                        Note: This is a simplified interface. In a real application, you would use a calendar date picker to select dates.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                                min={startDate ? startDate.toISOString().split('T')[0] : ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleBlockDates}
                        className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 transition-colors"
                    >
                        Block These Dates
                    </button>
                </div>

                <div className="flex justify-between">
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
} 