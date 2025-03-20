'use client';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { DateRange } from 'react-date-range';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';

interface SearchBarProps {
    // Add any props you need here
}

const SearchBar: React.FC<SearchBarProps> = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Location state
    const [location, setLocation] = useState('');
    const [locationFocused, setLocationFocused] = useState(false);

    // Date range state
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    });
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    // Guest count state
    const [guestCount, setGuestCount] = useState(1);
    const [guestPickerOpen, setGuestPickerOpen] = useState(false);

    // Initialize values from URL params if available
    useEffect(() => {
        const locationParam = searchParams.get('location');
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');
        const guestsParam = searchParams.get('guests');

        if (locationParam) {
            setLocation(locationParam);
        }

        if (startDateParam && endDateParam) {
            setDateRange({
                startDate: new Date(startDateParam),
                endDate: new Date(endDateParam),
                key: 'selection'
            });
        }

        if (guestsParam) {
            setGuestCount(parseInt(guestsParam, 10));
        }
    }, [searchParams]);

    // Clear search when path is exactly "/"
    useEffect(() => {
        if (pathname === '/' && !searchParams.toString()) {
            // Reset all form values when user navigates to home without query params
            setLocation('');
            setDateRange({
                startDate: new Date(),
                endDate: new Date(),
                key: 'selection'
            });
            setGuestCount(1);
        }
    }, [pathname, searchParams]);

    // Handlers
    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocation(e.target.value);
    };

    const handleDateChange = (ranges: any) => {
        setDateRange(ranges.selection);
    };

    const handleGuestChange = (count: number) => {
        if (count >= 1) {
            setGuestCount(count);
        }
    };

    const formatDateDisplay = () => {
        if (!dateRange.startDate && !dateRange.endDate) return 'Add dates';

        const start = format(dateRange.startDate, 'MMM d');
        const end = format(dateRange.endDate, 'MMM d, yyyy');

        if (start === end) return start;
        return `${start} - ${end}`;
    };

    const handleSearch = () => {
        // Build query params
        const params = new URLSearchParams();

        if (location) {
            params.append('location', location);
        }

        if (dateRange.startDate && dateRange.endDate) {
            params.append('startDate', dateRange.startDate.toISOString());
            params.append('endDate', dateRange.endDate.toISOString());
        }

        if (guestCount > 1) {
            params.append('guests', guestCount.toString());
        }

        // Navigate to home with query params
        router.push(`/?${params.toString()}`);

        // Close all dropdowns
        setLocationFocused(false);
        setDatePickerOpen(false);
        setGuestPickerOpen(false);
    };

    return (
        <div className={`relative flex items-center ${locationFocused || datePickerOpen || guestPickerOpen ? 'bg-gray-100' : 'bg-white'} rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] transition-shadow overflow-hidden`}>
            {/* Location */}
            <div className="relative flex-1 min-w-0">
                <div className={`flex items-center p-3 ${locationFocused ? 'bg-white rounded-full' : ''}`}
                    onClick={(e) => {
                        setLocationFocused(true);
                        setDatePickerOpen(false);
                        setGuestPickerOpen(false);
                    }}>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium">Where</label>
                        <input
                            type="text"
                            value={location}
                            onChange={handleLocationChange}
                            placeholder="Where are you going?"
                            className="w-full border-none p-0 focus:outline-none text-sm bg-transparent"
                            onFocus={() => setLocationFocused(true)}
                            onBlur={() => setTimeout(() => setLocationFocused(false), 100)}
                        />
                    </div>
                </div>
            </div>

            {/* Divider */}
            <span className="h-8 border-r border-gray-300 mx-2 z-10"></span>

            {/* Date Range */}
            <div className="relative flex-1 min-w-0">
                <div className={`flex items-center p-3 cursor-pointer ${datePickerOpen ? 'bg-white rounded-full' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setDatePickerOpen(!datePickerOpen);
                        setLocationFocused(false);
                        setGuestPickerOpen(false);
                    }}>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium">When</label>
                        <span className="text-sm">{formatDateDisplay()}</span>
                    </div>
                </div>

                {datePickerOpen && (
                    <div
                        className="absolute z-20 mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border"
                        onClick={(e) => e.stopPropagation()}>
                        <div onClick={(e) => e.stopPropagation()}>
                            <DateRange
                                ranges={[dateRange]}
                                onChange={handleDateChange}
                                minDate={new Date()}
                                months={1}
                                direction="horizontal"
                                rangeColors={["#FF385C"]}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Divider */}
            <span className="h-8 border-r border-gray-300 mx-2 z-10"></span>

            {/* Guest Count */}
            <div className="relative flex-1 min-w-0">
                <div className={`flex items-center p-3 cursor-pointer ${guestPickerOpen ? 'bg-white rounded-full' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setGuestPickerOpen(!guestPickerOpen);
                        setLocationFocused(false);
                        setDatePickerOpen(false);
                    }}>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium">Who</label>
                        <span className="text-sm">{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</span>
                    </div>
                </div>

                {guestPickerOpen && (
                    <div
                        className="absolute z-20 right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 border"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <span>Guests</span>
                            <div className="flex items-center">
                                <button
                                    className="w-8 h-8 rounded-full border flex items-center justify-center"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleGuestChange(guestCount - 1);
                                    }}
                                    disabled={guestCount <= 1}
                                >
                                    -
                                </button>
                                <span className="mx-3">{guestCount}</span>
                                <button
                                    className="w-8 h-8 rounded-full border flex items-center justify-center"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleGuestChange(guestCount + 1);
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Button */}
            <button
                className="bg-[#FF385C] text-white p-3 rounded-full hover:bg-[#E61E4D] transition-colors flex items-center justify-center ml-4 mr-2 hover:cursor-pointer"
                onClick={handleSearch}
            >
                <SearchIcon />
            </button>
        </div>
    );
};

export default SearchBar; 