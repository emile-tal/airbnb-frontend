import { Favorite, Listing, Reservation, User } from '../types';

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

// Listings (formerly Properties)
export async function getListings(): Promise<Listing[]> {
    const maxRetries = 2;
    let retries = 0;

    const fetchListings = async (): Promise<Listing[]> => {
        try {
            console.log('Client API: Fetching listings');
            const baseUrl = getBaseUrl();
            console.log(`Client API: Using base URL: ${baseUrl}`);

            const response = await fetch(`${baseUrl}/api/listings`, {
                cache: 'no-store',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                },
                next: { revalidate: 0 } // Ensure we're not using cached data
            });

            if (!response.ok) {
                console.error('Client API: Error response from /api/listings', response.status);

                // If response has JSON body, log it for debugging
                try {
                    const errorBody = await response.json();
                    console.error('Client API: Error details:', errorBody);
                    throw new ApiError(errorBody.message || 'Failed to retrieve listings', response.status);
                } catch (_) {
                    console.error('Client API: Could not parse error response body');
                    throw new ApiError('Failed to retrieve listings', response.status);
                }
            }

            const data = await response.json();
            if (!data || !Array.isArray(data)) {
                console.error('Client API: Unexpected data format received:', data);
                throw new ApiError('Unexpected data format received from API', 500);
            }

            console.log(`Client API: Successfully fetched ${data.length} listings`);
            return data;
        } catch (error) {
            console.error("Client API: Error getting listings:", error);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('Failed to retrieve listings', 500);
        }
    };

    while (retries <= maxRetries) {
        try {
            return await fetchListings();
        } catch (error) {
            if (retries === maxRetries) {
                console.error(`Client API: Max retries (${maxRetries}) reached for fetching listings`);
                throw new ApiError('Failed to retrieve listings after multiple attempts',
                    error instanceof ApiError ? error.status : 500);
            }
            retries++;
            console.log(`Client API: Retrying fetch listings (${retries}/${maxRetries})`);
            // Add a small delay before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // This should never be reached due to the throw in the while loop
    throw new ApiError('Failed to retrieve listings', 500);
}

// Get only user's listings (for dashboard)
export async function getUserListings(): Promise<Listing[]> {
    try {
        console.log('Client API: Fetching user listings');
        const baseUrl = getBaseUrl();
        console.log(`Client API: getUserListings using base URL: ${baseUrl}`);

        const response = await fetch(`${baseUrl}/api/listings/user`, {
            cache: 'no-store',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 0 } // Ensure we're not using cached data
        });

        console.log(`Client API: getUserListings response status: ${response.status}`);

        if (!response.ok) {
            console.error('Client API: Error response from /api/listings/user', response.status);

            try {
                const errorBody = await response.json();
                console.error('Client API: Error details:', errorBody);
                throw new ApiError(errorBody.message || 'Failed to retrieve user listings', response.status);
            } catch (jsonError) {
                console.error('Client API: Could not parse error response body', jsonError);
                throw new ApiError('Failed to retrieve user listings', response.status);
            }
        }

        const data = await response.json();
        console.log(`Client API: getUserListings raw response:`, data);

        if (!data || !Array.isArray(data)) {
            console.error('Client API: Unexpected data format received from user listings:', data);
            return []; // Return empty array instead of throwing
        }

        console.log(`Client API: Successfully fetched ${data.length} user listings`);
        return data;
    } catch (error) {
        console.error("Client API: Error getting user listings:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError('Failed to retrieve user listings', 500);
    }
}

export async function getListing(id: string): Promise<Listing> {
    try {
        console.log(`Client API: Fetching listing with id ${id}`);
        const response = await fetch(`${getBaseUrl()}/api/listings/${id}`, {
            cache: 'no-store',
            credentials: 'include',
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
        console.log('Client API: Creating new listing', listing);

        // Validate required fields before sending
        const requiredFields = ['title', 'description', 'imageSrc', 'category', 'roomCount',
            'bathroomCount', 'guestCount', 'locationValue', 'price'];

        const missingFields = requiredFields.filter(field => !listing[field as keyof typeof listing]);

        if (missingFields.length > 0) {
            console.error('Client API: Missing required fields:', missingFields);
            throw new ApiError(`Missing required fields: ${missingFields.join(', ')}`, 400);
        }

        const response = await fetch(`${getBaseUrl()}/api/listings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listing),
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Client API: Error response from POST /api/listings', response.status);

            // Try to get more detailed error info
            let errorMessage = 'Failed to create listing';
            try {
                const errorResponse = await response.json();
                console.error('Client API: Server error details:', errorResponse);
                errorMessage = errorResponse.message || errorMessage;
            } catch (jsonError) {
                console.error('Client API: Could not parse error response:', jsonError);
            }

            throw new ApiError(errorMessage, response.status);
        }

        const data = await response.json();
        console.log(`Client API: Successfully created listing with id ${data.id}`);
        return data;
    } catch (error) {
        console.error("Client API: Error creating listing:", error);
        if (error instanceof ApiError) {
            throw error;
        }
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