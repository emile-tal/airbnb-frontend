import { Session } from 'next-auth';
import { prisma as originalPrisma } from './prisma';

type UserContext = {
    userId?: string;
    isAdmin?: boolean;
};

/**
 * Check if a user is an admin
 * @param userId - The user ID to check
 * @returns True if the user is an admin
 */
export function checkIfUserIsAdmin(userId: string): boolean {
    // Implement your admin check logic here
    // For example, you could have a list of admin user IDs
    // or a database query to check for admin role
    // This is just a placeholder implementation
    const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];
    return ADMIN_USER_IDS.includes(userId);
}

/**
 * Creates a Prisma client instance that sets the user context for RLS
 * @param context - The user context containing user ID and admin status
 * @returns A Prisma client with RLS context set
 */
export function createSecurePrismaClient(context?: UserContext) {
    const userId = context?.userId || null;
    const isAdmin = context?.isAdmin || false;

    // Create a client that wraps every query with the SET/RESET commands
    return originalPrisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ args, query, model, operation }) {
                    // For these operations, we want to set the user context
                    // before executing the query
                    try {
                        // Set the application context for RLS
                        if (userId) {
                            await originalPrisma.$executeRawUnsafe(
                                `SET LOCAL app.current_user_id = '${userId}';`
                            );
                        } else {
                            await originalPrisma.$executeRawUnsafe(
                                `SET LOCAL app.current_user_id = NULL;`
                            );
                        }

                        await originalPrisma.$executeRawUnsafe(
                            `SET LOCAL app.is_admin = ${isAdmin};`
                        );

                        // Run the actual query
                        const result = await query(args);

                        // Reset the context after the query (for safety)
                        await originalPrisma.$executeRawUnsafe(
                            `RESET app.current_user_id; RESET app.is_admin;`
                        );

                        return result;
                    } catch (error) {
                        // Always reset on error to be safe
                        try {
                            await originalPrisma.$executeRawUnsafe(
                                `RESET app.current_user_id; RESET app.is_admin;`
                            );
                        } catch (resetError) {
                            console.error('Error resetting RLS context:', resetError);
                        }
                        throw error;
                    }
                },
            },
        },
    });
}

/**
 * Creates a Prisma client from the NextAuth session
 * @param session - The NextAuth session
 * @returns A Prisma client with user context from the session
 */
export function createPrismaFromSession(session?: Session | null) {
    if (!session?.user?.id) {
        return createSecurePrismaClient();
    }

    // Determine if the user is an admin (implement your own logic here)
    const isAdmin = checkIfUserIsAdmin(session.user.id);

    return createSecurePrismaClient({
        userId: session.user.id,
        isAdmin
    });
}

/**
 * Create a Prisma client with admin privileges
 * @returns A Prisma client with admin context
 */
export function createAdminPrismaClient() {
    return createSecurePrismaClient({
        userId: 'system',
        isAdmin: true
    });
}

export default createSecurePrismaClient; 