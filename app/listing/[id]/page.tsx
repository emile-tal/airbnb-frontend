'use client';

import { Listing, ListingAvailability } from '../../types';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { createReservation, getListing } from '../../lib/api';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Image from 'next/image';
import Link from 'next/link';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useSession } from 'next-auth/react';

// MUI theme to match the Airbnb color scheme
const theme = createTheme({
    palette: {
        primary: {
            main: '#FF385C',
        },
    },
});

export default function ListingDetail() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { data: session, status } = useSession();

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [availabilities, setAvailabilities] = useState<ListingAvailability[]>([]);
    const [checkInDate, setCheckInDate] = useState<Dayjs | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(null);
    const [error, setError] = useState<string>('');
    const [nightsCount, setNightsCount] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedGuests, setSelectedGuests] = useState(1);

    useEffect(() => {
        setIsMounted(true);
        const fetchListingAndAvailability = async () => {
            try {
                const listingData = await getListing(id as string);
                setListing(listingData);

                // Fetch availability data
                const availabilityRes = await fetch(`/api/availability?listingId=${id}`);
                if (availabilityRes.ok) {
                    const availabilityData = await availabilityRes.json();
                    setAvailabilities(availabilityData);
                }
            } catch (error) {
                console.error('Error fetching listing:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchListingAndAvailability();
    }, [id, router]);

    // Update nights count whenever dates change
    useEffect(() => {
        if (checkInDate && checkOutDate) {
            const nights = checkOutDate.diff(checkInDate, 'day');
            setNightsCount(nights);
        } else {
            setNightsCount(0);
        }
    }, [checkInDate, checkOutDate]);

    // Check if a date is blocked (in the availability periods)
    const isDateBlocked = (date: Dayjs) => {
        return availabilities.some(availability => {
            const startDate = dayjs(availability.startDate);
            const endDate = dayjs(availability.endDate);
            return date.isAfter(startDate) && date.isBefore(endDate) ||
                date.isSame(startDate, 'day') ||
                date.isSame(endDate, 'day');
        });
    };

    // Handler for check-in date change
    const handleCheckInChange = (date: Dayjs | null) => {
        setCheckInDate(date);
        setError('');

        // If new check-in is after current check-out, reset check-out
        if (date && checkOutDate && date.isAfter(checkOutDate)) {
            setCheckOutDate(null);
        }
    };

    // Handler for check-out date change
    const handleCheckOutChange = (date: Dayjs | null) => {
        if (!date) {
            setCheckOutDate(null);
            return;
        }

        // Validate that no dates in the range are blocked
        if (checkInDate) {
            const start = checkInDate.add(1, 'day'); // Start from day after check-in
            const end = date;

            let current = start;
            while (current.isBefore(end) || current.isSame(end, 'day')) {
                if (isDateBlocked(current)) {
                    setError('Your date range includes blocked dates');
                    return;
                }
                current = current.add(1, 'day');
            }
        }

        setCheckOutDate(date);
        setError('');
    };

    const calculateTotalPrice = () => {
        if (!checkInDate || !checkOutDate || !listing) return 0;
        return listing.price * nightsCount;
    };

    const handleReservation = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        if (!listing || !checkInDate || !checkOutDate) {
            setError('Please select check-in and check-out dates');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const totalPrice = calculateTotalPrice() + 75 + 65; // base + cleaning fee + service fee

            // Get user ID from session or fetch it if not available
            let userId = session.user?.id;

            // If no user ID in session, try fetching it
            if (!userId && session.user?.email) {
                try {
                    const userResponse = await fetch('/api/users/me');
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        userId = userData.id;
                    } else {
                        const errorData = await userResponse.json();
                        throw new Error(errorData.message || 'Failed to get user information');
                    }
                } catch (userError) {
                    console.error('Error fetching user data:', userError);
                    setError('Failed to retrieve your user information. Please try logging in again.');
                    setIsSubmitting(false);
                    return;
                }
            }

            if (!userId) {
                setError('User ID not available. Please try logging in again.');
                setIsSubmitting(false);
                return;
            }

            try {
                await createReservation({
                    listingId: listing.id,
                    userId,
                    startDate: checkInDate.toDate(),
                    endDate: checkOutDate.toDate(),
                    totalPrice,
                    status: 'pending'
                });

                // Redirect to trips page or show success message
                router.push('/trips');
            } catch (reservationError: any) {
                console.error('Error creating reservation:', reservationError);

                // Handle specific error messages
                if (reservationError?.message?.includes('conflict')) {
                    setError('This reservation conflicts with an existing booking. Please select different dates.');
                } else if (reservationError?.status === 400) {
                    setError(reservationError.message || 'Invalid reservation data. Please check your selections.');
                } else if (reservationError?.status === 401) {
                    setError('You need to be logged in to make a reservation. Please log in and try again.');
                    setTimeout(() => router.push('/login'), 2000);
                } else if (reservationError?.status === 408) {
                    setError('The request timed out. Please check your connection and try again.');
                } else {
                    setError('Failed to create reservation. Please try again later.');
                }
            }
        } catch (error) {
            console.error('Unexpected error during reservation:', error);
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to determine if a date should be disabled
    const shouldDisableDate = (date: Dayjs) => {
        // Disable dates before today
        if (date.isBefore(dayjs(), 'day')) {
            return true;
        }

        // Disable blocked dates from availability
        return isDateBlocked(date);
    };

    // Function to determine if a check-out date should be disabled
    const shouldDisableCheckoutDate = (date: Dayjs) => {
        // Disable dates before or equal to check-in
        if (!checkInDate || date.isBefore(checkInDate, 'day') || date.isSame(checkInDate, 'day')) {
            return true;
        }

        // Check if there's a blocked date between check-in and this date
        let current = checkInDate.add(1, 'day'); // Start from day after check-in
        while (current.isBefore(date, 'day')) { // Check all days between
            if (isDateBlocked(current)) {
                return true; // If any day in between is blocked, disable this date
            }
            current = current.add(1, 'day');
        }

        // Disable the date if it's blocked
        return isDateBlocked(date);
    };

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
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                                        <div className="grid grid-cols-1 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Check-in
                                                </label>
                                                <DatePicker
                                                    value={checkInDate}
                                                    onChange={handleCheckInChange}
                                                    shouldDisableDate={shouldDisableDate}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            variant: 'outlined',
                                                            size: 'small'
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Check-out
                                                </label>
                                                <DatePicker
                                                    value={checkOutDate}
                                                    onChange={handleCheckOutChange}
                                                    shouldDisableDate={shouldDisableCheckoutDate}
                                                    disabled={!checkInDate}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            variant: 'outlined',
                                                            size: 'small'
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="text-red-500 text-sm mb-4">
                                                {error}
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-500 mb-4 flex items-center">
                                            <div className="w-3 h-3 bg-gray-300 rounded-sm mr-1"></div>
                                            <span>Dates in gray are unavailable (blocked by host)</span>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Guests
                                            </label>
                                            <select
                                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                                value={selectedGuests}
                                                onChange={(e) => setSelectedGuests(parseInt(e.target.value))}
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
                                        className="w-full bg-[#FF385C] hover:bg-[#E61E4D] hover:cursor-pointer text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={!checkInDate || !checkOutDate || !!error || isSubmitting}
                                        onClick={handleReservation}
                                    >
                                        {isSubmitting ? 'Processing...' : 'Reserve'}
                                    </button>

                                    <div className="mt-4 border-t pt-4">
                                        {checkInDate && checkOutDate && (
                                            <>
                                                <div className="flex justify-between mb-2">
                                                    <span>${listing.price} x {nightsCount} {nightsCount === 1 ? 'night' : 'nights'}</span>
                                                    <span>${calculateTotalPrice()}</span>
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
                                                    <span>${calculateTotalPrice() + 75 + 65}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </LocalizationProvider>
        </ThemeProvider>
    );
} 