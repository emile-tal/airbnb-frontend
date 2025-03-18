import { Favorite, Listing, Reservation, User } from '../types';

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// Listings (formerly Properties)
export async function getListings(): Promise<Listing[]> {
    try {
        console.log('Client API: Fetching listings');
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${origin}/api/listings`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('Client API: Error response from /api/listings', response.status);
            throw new ApiError('Failed to retrieve listings', response.status);
        }

        const data = await response.json();
        console.log(`Client API: Successfully fetched ${data.length} listings`);
        return data;
    } catch (error) {
        console.error("Client API: Error getting listings:", error);
        throw new ApiError('Failed to retrieve listings', 500);
    }
}

export async function getListing(id: string): Promise<Listing> {
    try {
        console.log(`Client API: Fetching listing with id ${id}`);
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${origin}/api/listings/${id}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`Client API: Error response from /api/listings/${id}`, response.status);
            throw new ApiError('Listing not found', response.status);
        }

        const data = await response.json();
        console.log(`Client API: Successfully fetched listing with id ${id}`);
        return data;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Client API: Error getting listing:", error);
        throw new ApiError('Failed to retrieve listing', 500);
    }
}

export async function createListing(listing: Omit<Listing, 'id' | 'createdAt'>): Promise<Listing> {
    try {
        console.log('Client API: Creating new listing');
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${origin}/api/listings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listing),
        });

        if (!response.ok) {
            console.error('Client API: Error response from POST /api/listings', response.status);
            throw new ApiError('Failed to create listing', response.status);
        }

        const data = await response.json();
        console.log(`Client API: Successfully created listing with id ${data.id}`);
        return data;
    } catch (error) {
        console.error("Client API: Error creating listing:", error);
        throw new ApiError('Failed to create listing', 500);
    }
}

export async function updateListing(id: string, data: Partial<Omit<Listing, 'id' | 'createdAt'>>): Promise<Listing> {
    try {
        const response = await fetch(`/api/listings/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new ApiError('Failed to update listing', response.status);
        }

        return response.json();
    } catch (error) {
        console.error("Error updating listing:", error);
        throw new ApiError('Failed to update listing', 500);
    }
}

export async function deleteListing(id: string): Promise<void> {
    try {
        const response = await fetch(`/api/listings/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new ApiError('Failed to delete listing', response.status);
        }
    } catch (error) {
        console.error("Error deleting listing:", error);
        throw new ApiError('Failed to delete listing', 500);
    }
}

// Reservations (formerly Bookings)
export async function createReservation(
    reservation: Omit<Reservation, 'id' | 'createdAt'>
): Promise<Reservation> {
    try {
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservation),
        });

        if (!response.ok) {
            throw new ApiError('Failed to create reservation', response.status);
        }

        return response.json();
    } catch (error) {
        console.error("Error creating reservation:", error);
        throw new ApiError('Failed to create reservation', 500);
    }
}

export async function getUserReservations(userId: string): Promise<Reservation[]> {
    try {
        const reservations = await fetch(`/api/reservations?userId=${userId}`);

        if (!reservations.ok) {
            throw new ApiError('Failed to retrieve reservations', reservations.status);
        }

        return reservations.json();
    } catch (error) {
        console.error("Error getting user reservations:", error);
        throw new ApiError('Failed to retrieve reservations', 500);
    }
}

export async function getListingReservations(listingId: string): Promise<Reservation[]> {
    try {
        const reservations = await fetch(`/api/reservations?listingId=${listingId}`);

        if (!reservations.ok) {
            throw new ApiError('Failed to retrieve reservations', reservations.status);
        }

        return reservations.json();
    } catch (error) {
        console.error("Error getting listing reservations:", error);
        throw new ApiError('Failed to retrieve reservations', 500);
    }
}

// User
export async function getUserById(id: string): Promise<User> {
    try {
        const response = await fetch(`/api/users/${id}`);

        if (!response.ok) {
            throw new ApiError('User not found', response.status);
        }

        return response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Error getting user:", error);
        throw new ApiError('Failed to retrieve user', 500);
    }
}

export async function getUserByEmail(email: string): Promise<User> {
    try {
        const response = await fetch(`/api/users?email=${email}`);

        if (!response.ok) {
            throw new ApiError('User not found', response.status);
        }

        const users = await response.json();

        if (users.length === 0) {
            throw new ApiError('User not found', 404);
        }

        return users[0];
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Error getting user by email:", error);
        throw new ApiError('Failed to retrieve user', 500);
    }
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new ApiError('Failed to update user', response.status);
        }

        return response.json();
    } catch (error) {
        console.error("Error updating user:", error);
        throw new ApiError('Failed to update user', 500);
    }
}

// Favorites
export async function addFavorite(userId: string, listingId: string): Promise<Favorite> {
    try {
        const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, listingId }),
        });

        if (!response.ok) {
            throw new ApiError('Failed to add favorite', response.status);
        }

        return response.json();
    } catch (error) {
        console.error("Error adding favorite:", error);
        throw new ApiError('Failed to add favorite', 500);
    }
}

export async function removeFavorite(userId: string, listingId: string): Promise<void> {
    try {
        const response = await fetch(`/api/favorites?userId=${userId}&listingId=${listingId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new ApiError('Failed to remove favorite', response.status);
        }
    } catch (error) {
        console.error("Error removing favorite:", error);
        throw new ApiError('Failed to remove favorite', 500);
    }
}

export async function getUserFavorites(userId: string): Promise<Favorite[]> {
    try {
        const response = await fetch(`/api/favorites?userId=${userId}`);

        if (!response.ok) {
            throw new ApiError('Failed to retrieve favorites', response.status);
        }

        return response.json();
    } catch (error) {
        console.error("Error getting user favorites:", error);
        throw new ApiError('Failed to retrieve favorites', 500);
    }
}

// All mock API functions have been replaced with actual Prisma implementations 