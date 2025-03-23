import { createAdminPrismaClient } from './secure-prisma';

/**
 * Utility functions for administrative operations
 * These functions bypass RLS by using an admin context
 */

/**
 * Perform database operations with admin privileges
 * Use this function sparingly and only for legitimate admin operations
 * @param operation Function that performs database operations
 * @returns Result of the operation
 */
export async function withAdminAccess<T>(operation: (adminPrisma: any) => Promise<T>): Promise<T> {
    // Create a Prisma client with admin privileges that bypasses RLS
    const adminPrisma = createAdminPrismaClient();

    try {
        // Execute the operation with admin privileges
        return await operation(adminPrisma);
    } finally {
        // Always disconnect properly
        await adminPrisma.$disconnect();
    }
}

/**
 * Grant admin privileges to a user
 * This is just an example implementation - you would need to
 * adapt this to your admin role management system
 * @param userId User ID to make an admin
 */
export async function makeUserAdmin(userId: string): Promise<void> {
    // This is just an example implementation
    // In a real system, you might:
    // 1. Update a user_roles table
    // 2. Add the user to an admin list in environment variables
    // 3. Set a flag in the User model itself

    // For this example, we'll assume you store admin IDs in an environment variable
    const currentAdmins = process.env.ADMIN_USER_IDS?.split(',') || [];

    if (!currentAdmins.includes(userId)) {
        currentAdmins.push(userId);

        // This wouldn't actually update the environment variable at runtime
        // This is just for demonstration - you would need to store this elsewhere
        process.env.ADMIN_USER_IDS = currentAdmins.join(',');

        console.log(`User ${userId} is now an admin`);
    }
}

/**
 * Create a new listing bypassing RLS checks
 * This is an example of an admin operation
 * @param listingData Listing data to create
 * @returns The created listing
 */
export async function adminCreateListing(listingData: any) {
    return withAdminAccess(async (adminPrisma) => {
        return await adminPrisma.listing.create({
            data: listingData
        });
    });
}

/**
 * Get all users in the system (admin-only operation)
 * @returns List of all users
 */
export async function adminGetAllUsers() {
    return withAdminAccess(async (adminPrisma) => {
        return await adminPrisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                // Don't expose sensitive fields
            }
        });
    });
} 