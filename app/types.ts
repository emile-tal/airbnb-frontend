export interface Property {
    id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
    amenities: string[];
    availability: string[];
    description?: string;
    hostId?: string;
    created_at?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    properties?: string[]; // IDs of properties owned by user
}

export interface Booking {
    id: string;
    propertyId: string;
    userId: string;
    checkIn: string; // ISO date string
    checkOut: string; // ISO date string
    guests: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    created_at: string;
} 