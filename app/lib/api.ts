import { Favorite, Listing, Reservation, User } from '../types';

import { prisma } from '../../lib/prisma';

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
        const listings = await prisma.listing.findMany();
        return listings;
    } catch (error) {
        console.error("Error getting listings:", error);
        throw new ApiError('Failed to retrieve listings', 500);
    }
}

export async function getListing(id: string): Promise<Listing> {
    try {
        const listing = await prisma.listing.findUnique({
            where: { id }
        });

        if (!listing) {
            throw new ApiError('Listing not found', 404);
        }

        return listing;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Error getting listing:", error);
        throw new ApiError('Failed to retrieve listing', 500);
    }
}

export async function createListing(listing: Omit<Listing, 'id' | 'createdAt'>): Promise<Listing> {
    try {
        const newListing = await prisma.listing.create({
            data: {
                ...listing
            }
        });

        return newListing;
    } catch (error) {
        console.error("Error creating listing:", error);
        throw new ApiError('Failed to create listing', 500);
    }
}

export async function updateListing(id: string, data: Partial<Omit<Listing, 'id' | 'createdAt'>>): Promise<Listing> {
    try {
        const updatedListing = await prisma.listing.update({
            where: { id },
            data
        });

        return updatedListing;
    } catch (error) {
        console.error("Error updating listing:", error);
        throw new ApiError('Failed to update listing', 500);
    }
}

export async function deleteListing(id: string): Promise<void> {
    try {
        await prisma.listing.delete({
            where: { id }
        });
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
        const newReservation = await prisma.reservation.create({
            data: {
                ...reservation
            }
        });

        return newReservation;
    } catch (error) {
        console.error("Error creating reservation:", error);
        throw new ApiError('Failed to create reservation', 500);
    }
}

export async function getUserReservations(userId: string): Promise<Reservation[]> {
    try {
        const reservations = await prisma.reservation.findMany({
            where: { userId }
        });

        return reservations;
    } catch (error) {
        console.error("Error getting user reservations:", error);
        throw new ApiError('Failed to retrieve reservations', 500);
    }
}

export async function getListingReservations(listingId: string): Promise<Reservation[]> {
    try {
        const reservations = await prisma.reservation.findMany({
            where: { listingId }
        });

        return reservations;
    } catch (error) {
        console.error("Error getting listing reservations:", error);
        throw new ApiError('Failed to retrieve reservations', 500);
    }
}

// User
export async function getUserById(id: string): Promise<User> {
    try {
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            throw new ApiError('User not found', 404);
        }

        return user;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Error getting user:", error);
        throw new ApiError('Failed to retrieve user', 500);
    }
}

export async function getUserByEmail(email: string): Promise<User> {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new ApiError('User not found', 404);
        }

        return user;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("Error getting user by email:", error);
        throw new ApiError('Failed to retrieve user', 500);
    }
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data
        });

        return updatedUser;
    } catch (error) {
        console.error("Error updating user:", error);
        throw new ApiError('Failed to update user', 500);
    }
}

// Favorites
export async function addFavorite(userId: string, listingId: string): Promise<Favorite> {
    try {
        const favorite = await prisma.favorite.create({
            data: {
                userId,
                listingId
            }
        });

        return favorite;
    } catch (error) {
        console.error("Error adding favorite:", error);
        throw new ApiError('Failed to add favorite', 500);
    }
}

export async function removeFavorite(userId: string, listingId: string): Promise<void> {
    try {
        await prisma.favorite.deleteMany({
            where: {
                userId,
                listingId
            }
        });
    } catch (error) {
        console.error("Error removing favorite:", error);
        throw new ApiError('Failed to remove favorite', 500);
    }
}

export async function getUserFavorites(userId: string): Promise<Favorite[]> {
    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId }
        });

        return favorites;
    } catch (error) {
        console.error("Error getting user favorites:", error);
        throw new ApiError('Failed to retrieve favorites', 500);
    }
}

// All mock API functions have been replaced with actual Prisma implementations 