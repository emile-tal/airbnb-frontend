import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Create a new PrismaClient instance
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['query', 'error', 'warn']
    });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Add a method to check database connection
export async function checkDatabaseConnection() {
    try {
        console.log('Checking database connection...');
        // Use a simple query with findFirst instead of raw SQL
        // This avoids prepared statement issues
        await prisma.$connect();
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