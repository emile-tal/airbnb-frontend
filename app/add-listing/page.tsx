'use client';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';

import ImageUpload from '../components/ImageUpload';
import Link from 'next/link';
import { createListing } from '../lib/api';
import { useRouter } from 'next/navigation';

// Categories list - we use the same definition as the edit page for consistency
const CATEGORIES = [
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "House" },
    { value: "cabin", label: "Cabin" },
    { value: "villa", label: "Villa" },
    { value: "beachfront", label: "Beachfront" },
    { value: "countryside", label: "Countryside" }
];

export default function AddListing() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [locationValue, setLocationValue] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0].value); // Default to first category
    const [roomCount, setRoomCount] = useState('1');
    const [bathroomCount, setBathroomCount] = useState('1');
    const [guestCount, setGuestCount] = useState('1');
    const [imageSrc, setImageSrc] = useState('');
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create the listing
            const newListing = await createListing({
                title,
                description,
                imageSrc,
                category,
                roomCount: parseInt(roomCount),
                bathroomCount: parseInt(bathroomCount),
                guestCount: parseInt(guestCount),
                locationValue,
                userId: 'user-1', // This would be the actual user ID in a real app
                price: parseInt(price)
            });

            console.log('Listing created:', newListing);

            // Redirect to listing page after successful submission
            router.push(`/listing/${newListing.id}`);
        } catch (error) {
            console.error('Error adding listing:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) {
        return null; // Return nothing during server-side rendering
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-white">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <Link href="/" className="text-[#FF385C] hover:underline mb-4 inline-block">
                        &larr; Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold">List Your Home</h1>
                    <p className="text-gray-600 mt-2">Share your space with travelers from around the world</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Listing basics */}
                    <section className="bg-white rounded-lg p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold mb-4">Listing Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Listing Title
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                    placeholder="e.g. Cozy Beach House"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <input
                                    id="location"
                                    type="text"
                                    value={locationValue}
                                    onChange={(e) => setLocationValue(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                    placeholder="e.g. Malibu, CA"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Price per Night (USD)
                                </label>
                                <input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                    placeholder="e.g. 150"
                                    min="1"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                    placeholder="Describe your listing..."
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Image */}
                    <section className="bg-white rounded-lg p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold mb-4">Listing Image</h2>
                        <ImageUpload value={imageSrc} onChange={setImageSrc} />
                    </section>

                    {/* Category and counts */}
                    <section className="bg-white rounded-lg p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold mb-4">Property Details</h2>

                        <div className="space-y-4">
                            <div>
                                <FormControl fullWidth>
                                    <InputLabel id="category-label">Category</InputLabel>
                                    <Select
                                        labelId="category-label"
                                        id="category"
                                        value={category}
                                        label="Category"
                                        onChange={(e) => setCategory(e.target.value as string)}
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgb(209, 213, 219)',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#FF385C',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#FF385C',
                                            }
                                        }}
                                    >
                                        {CATEGORIES.map((category) => (
                                            <MenuItem key={category.value} value={category.value}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="roomCount" className="block text-sm font-medium text-gray-700 mb-1">
                                        Rooms
                                    </label>
                                    <select
                                        id="roomCount"
                                        value={roomCount}
                                        onChange={(e) => setRoomCount(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                    >
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="bathroomCount" className="block text-sm font-medium text-gray-700 mb-1">
                                        Bathrooms
                                    </label>
                                    <select
                                        id="bathroomCount"
                                        value={bathroomCount}
                                        onChange={(e) => setBathroomCount(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                    >
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">
                                        Guests
                                    </label>
                                    <select
                                        id="guestCount"
                                        value={guestCount}
                                        onChange={(e) => setGuestCount(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 bg-[#FF385C] text-white rounded-md font-medium hover:bg-[#E61E4D] transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Submitting...' : 'List Home'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 