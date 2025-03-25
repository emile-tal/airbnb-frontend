import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Create a new PrismaClient instance with connection retry logic and pools
const prismaClientSingleton = () => {
    const client = new PrismaClient({
        log: ['query', 'error', 'warn'],
        datasources: {
            db: {
                url: process.env.POSTGRES_URL_NON_POOLING,
            },
        },
        errorFormat: 'pretty',
    });

    // Add middleware to handle connection issues
    client.$use(async (params, next) => {
        try {
            return await next(params);
        } catch (error: unknown) {
            // Log detailed error information
            console.error('Database operation error:', {
                error: error instanceof Error ? {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                } : error,
                params
            });

            // Detect the specific prepared statement error
            if (error instanceof Error &&
                (error.message?.includes('prepared statement') ||
                    (error.message && /prepared statement ".*?" already exists/.test(error.message)))) {
                console.error('Detected prepared statement conflict, reconnecting...');

                try {
                    await client.$disconnect();
                    await client.$connect();

                    // Retry the operation with a fresh connection
                    console.log('Retrying operation after reconnection...');
                    return await next(params);
                } catch (retryError) {
                    console.error('Error during connection retry:', retryError);
                    throw retryError;
                }
            }

            throw error;
        }
    });

    return client;
};

// Create and export the prisma client
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Only register the client as global in non-production environments
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Function to safely execute a Prisma query with retries
export async function executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3
): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: unknown) {
            lastError = error;
            console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error);

            // Only retry if it's a connection-related issue
            if (error instanceof Error &&
                (error.message?.includes('prepared statement') ||
                    error.message?.includes('connection') ||
                    error.message?.includes('timeout'))) {
                // Wait before retrying (exponential backoff)
                if (attempt < maxRetries) {
                    const delay = Math.min(100 * Math.pow(2, attempt), 2000);
                    console.log(`Retrying after ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));

                    // Try to reset the connection
                    try {
                        await prisma.$disconnect();
                        await prisma.$connect();
                    } catch (connError) {
                        console.error('Error resetting connection:', connError);
                    }
                }
            } else {
                throw error;
            }
        }
    }

    throw lastError;
}

// Function to try reconnecting to the database
export async function reconnectDatabase() {
    try {
        console.log('Attempting to reconnect to database...');
        await prisma.$disconnect();
        await prisma.$connect();
        console.log('Database reconnection successful');
        return true;
    } catch (error) {
        console.error('Database reconnection failed:', error);
        return false;
    }
}

// Add a method to check database connection
export async function checkDatabaseConnection() {
    try {
        console.log('Checking database connection...');
        console.log('Database URL:', process.env.POSTGRES_PRISMA_URL?.split('@')[1]?.split('/')[0] || 'URL not found');

        await prisma.$connect();

        // Test the connection with a simple query
        const result = await prisma.$queryRaw`SELECT 1 as connected;`;
        console.log('Database connection test result:', result);

        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }
        return false;
    }
}

export default prisma; 