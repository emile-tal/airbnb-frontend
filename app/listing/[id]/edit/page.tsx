"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ImageUpload from "@/app/components/ImageUpload";
import Link from "next/link";
import { Listing } from "@/app/types";
import { useSession } from "next-auth/react";

export default function EditListing() {
    const params = useParams();
    const id = params.id as string;

    const { data: session, status } = useSession();
    const router = useRouter();
    const [listing, setListing] = useState<Listing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageSrc: "",
        category: "",
        roomCount: 1,
        bathroomCount: 1,
        guestCount: 1,
        locationValue: "",
        price: 1,
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        const fetchListing = async () => {
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
                setFormData({
                    title: data.title,
                    description: data.description,
                    imageSrc: data.imageSrc,
                    category: data.category,
                    roomCount: data.roomCount,
                    bathroomCount: data.bathroomCount,
                    guestCount: data.guestCount,
                    locationValue: data.locationValue,
                    price: data.price,
                });
            } catch (error) {
                console.error("Error fetching listing:", error);
                setError("Failed to load listing details");
            } finally {
                setIsLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchListing();
        }
    }, [id, router, session, status]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "price" || name === "roomCount" || name === "bathroomCount" || name === "guestCount"
                ? parseInt(value)
                : value,
        }));
    };

    const handleImageChange = (value: string) => {
        setFormData((prev) => ({ ...prev, imageSrc: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.imageSrc) {
            setError("Please upload an image");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch(`/api/listings/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to update listing");
            }

            router.push("/dashboard");
        } catch (error) {
            console.error("Error updating listing:", error);
            setError("Failed to update listing. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Edit Your Listing</h1>

                {error && (
                    <div className="bg-red-50 p-4 rounded-md mb-6">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Listing Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                        >
                            <option value="">Select a category</option>
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="cabin">Cabin</option>
                            <option value="villa">Villa</option>
                            <option value="beachfront">Beachfront</option>
                            <option value="countryside">Countryside</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rooms
                            </label>
                            <input
                                type="number"
                                name="roomCount"
                                value={formData.roomCount}
                                onChange={handleChange}
                                min="1"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bathrooms
                            </label>
                            <input
                                type="number"
                                name="bathroomCount"
                                value={formData.bathroomCount}
                                onChange={handleChange}
                                min="1"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Guests
                            </label>
                            <input
                                type="number"
                                name="guestCount"
                                value={formData.guestCount}
                                onChange={handleChange}
                                min="1"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            name="locationValue"
                            value={formData.locationValue}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price per night ($)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="1"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image
                        </label>
                        <ImageUpload
                            value={formData.imageSrc}
                            onChange={handleImageChange}
                        />
                    </div>

                    <div className="flex justify-between">
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 