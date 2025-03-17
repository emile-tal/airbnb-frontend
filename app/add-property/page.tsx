'use client';

import Link from 'next/link';
import { mockApi } from '../lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddProperty() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [amenities, setAmenities] = useState<string[]>([]);
    const [newAmenity, setNewAmenity] = useState('');
    const [availability, setAvailability] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');

    const handleAddAmenity = () => {
        if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
            setAmenities([...amenities, newAmenity.trim()]);
            setNewAmenity('');
        }
    };

    const handleRemoveAmenity = (amenity: string) => {
        setAmenities(amenities.filter(a => a !== amenity));
    };

    const handleAddAvailability = () => {
        if (startDate && endDate) {
            const availabilityString = `${startDate} - ${endDate}`;
            if (!availability.includes(availabilityString)) {
                setAvailability([...availability, availabilityString]);
                setStartDate('');
                setEndDate('');
            }
        }
    };

    const handleRemoveAvailability = (period: string) => {
        setAvailability(availability.filter(a => a !== period));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileArray = Array.from(e.target.files);
            setImages([...images, ...fileArray]);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Here you would normally upload to Supabase and your Express backend
        try {
            // Create the property
            const newProperty = await mockApi.createProperty({
                title,
                location,
                price: parseFloat(price),
                amenities,
                availability,
                images: images.map(img => img.name), // In a real app, we'd upload to storage
                description
            });

            console.log('Property created:', newProperty);

            // Redirect to property page after successful submission
            router.push(`/property/${newProperty.id}`);
        } catch (error) {
            console.error('Error adding property:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-white">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <Link href="/" className="text-[#FF385C] hover:underline mb-4 inline-block">
                        &larr; Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold">List Your Property</h1>
                    <p className="text-gray-600 mt-2">Share your space with travelers from around the world</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Property basics */}
                    <section className="bg-white rounded-lg p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold mb-4">Property Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Property Title
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
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
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
                                    placeholder="Describe your property..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Photos */}
                    <section className="bg-white rounded-lg p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold mb-4">Property Photos</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Photos (Max 5)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="w-full"
                                    disabled={images.length >= 5}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Add up to 5 photos to showcase your property.
                                </p>
                            </div>

                            {images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {images.map((img, index) => (
                                        <div key={index} className="relative">
                                            <div className="border rounded-md p-2 bg-gray-50">
                                                <div className="text-xs truncate max-w-[150px]">{img.name}</div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm text-gray-500 hover:text-gray-700"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Amenities */}
                    <section className="bg-white rounded-lg p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold mb-4">Amenities</h2>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newAmenity}
                                    onChange={(e) => setNewAmenity(e.target.value)}
                                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                    placeholder="e.g. Wifi, Kitchen, Pool"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddAmenity}
                                    className="px-4 py-2 bg-[#FF385C] text-white rounded-md hover:bg-[#E61E4D]"
                                >
                                    Add
                                </button>
                            </div>

                            {amenities.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {amenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                            <span className="text-sm">{amenity}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAmenity(amenity)}
                                                className="ml-2 text-gray-500 hover:text-gray-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Availability */}
                    <section className="bg-white rounded-lg p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold mb-4">Availability</h2>

                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1">
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C]"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={handleAddAvailability}
                                        className="px-4 py-2 bg-[#FF385C] text-white rounded-md hover:bg-[#E61E4D]"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {availability.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {availability.map((period, index) => (
                                        <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                            <span className="text-sm">{period}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAvailability(period)}
                                                className="ml-2 text-gray-500 hover:text-gray-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 bg-[#FF385C] text-white rounded-md font-medium hover:bg-[#E61E4D] transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Submitting...' : 'List Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 