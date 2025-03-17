import { Booking, Property, User } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(data.message || 'An error occurred', response.status);
    }

    return data;
}

// Properties
export async function getProperties(): Promise<Property[]> {
    return fetchApi<Property[]>('/properties');
}

export async function getProperty(id: string): Promise<Property> {
    return fetchApi<Property>(`/properties/${id}`);
}

export async function createProperty(property: Omit<Property, 'id'>): Promise<Property> {
    return fetchApi<Property>('/properties', {
        method: 'POST',
        body: JSON.stringify(property),
    });
}

export async function uploadPropertyImage(
    propertyId: string,
    file: File
): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/properties/${propertyId}/images`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new ApiError(error.message || 'Failed to upload image', response.status);
    }

    return response.json();
}

// Bookings
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'status'>): Promise<Booking> {
    return fetchApi<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(booking),
    });
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
    return fetchApi<Booking[]>(`/users/${userId}/bookings`);
}

// User
export async function getUserProfile(): Promise<User> {
    return fetchApi<User>('/users/profile');
}

export async function updateUserProfile(user: Partial<User>): Promise<User> {
    return fetchApi<User>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(user),
    });
}

// Mock functions for development
export const mockApi = {
    getProperties: async (): Promise<Property[]> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return [
            {
                id: '1',
                title: 'Cozy Beach House',
                location: 'Malibu, CA',
                price: 250,
                images: ['/placeholder-house.jpg'],
                amenities: ['Wifi', 'Kitchen', 'Beachfront', 'Parking'],
                availability: ['May 1-15, 2023', 'June 3-28, 2023'],
                description: 'Beautiful beachfront property with stunning ocean views. Perfect for a relaxing getaway with family or friends. Easy access to local attractions and restaurants.'
            },
            {
                id: '2',
                title: 'Mountain Retreat',
                location: 'Aspen, CO',
                price: 350,
                images: ['/placeholder-cabin.jpg'],
                amenities: ['Fireplace', 'Hot tub', 'Mountain view', 'Hiking trails'],
                availability: ['April 10-30, 2023', 'July 5-25, 2023'],
                description: 'Escape to this serene mountain cabin surrounded by nature. Enjoy hiking, skiing, and the peaceful mountain atmosphere. Perfect for nature lovers and outdoor enthusiasts.'
            }
        ];
    },

    getProperty: async (id: string): Promise<Property> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const properties = {
            '1': {
                id: '1',
                title: 'Cozy Beach House',
                location: 'Malibu, CA',
                price: 250,
                images: ['/placeholder-house.jpg'],
                amenities: ['Wifi', 'Kitchen', 'Beachfront', 'Parking'],
                availability: ['May 1-15, 2023', 'June 3-28, 2023'],
                description: 'Beautiful beachfront property with stunning ocean views. Perfect for a relaxing getaway with family or friends. Easy access to local attractions and restaurants.'
            },
            '2': {
                id: '2',
                title: 'Mountain Retreat',
                location: 'Aspen, CO',
                price: 350,
                images: ['/placeholder-cabin.jpg'],
                amenities: ['Fireplace', 'Hot tub', 'Mountain view', 'Hiking trails'],
                availability: ['April 10-30, 2023', 'July 5-25, 2023'],
                description: 'Escape to this serene mountain cabin surrounded by nature. Enjoy hiking, skiing, and the peaceful mountain atmosphere. Perfect for nature lovers and outdoor enthusiasts.'
            }
        };

        const property = properties[id as keyof typeof properties];

        if (!property) {
            throw new ApiError('Property not found', 404);
        }

        return property;
    },

    createProperty: async (property: Omit<Property, 'id'>): Promise<Property> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            ...property,
            id: Math.random().toString(36).substring(2, 9),
            created_at: new Date().toISOString()
        };
    }
}; 