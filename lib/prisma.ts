import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

let prisma: PrismaClient;

if (typeof window === 'undefined') {
    // This is on the server side
    console.log('Initializing Prisma client on server side');

    // Check if we already have a connection to the database
    if (process.env.NODE_ENV === 'production') {
        console.log('Production environment: creating new PrismaClient');
        prisma = new PrismaClient();
    } else {
        // In development, use a global variable to preserve connection across hot-reloads
        console.log('Development environment: checking for existing global PrismaClient');
        const globalWithPrisma = global as typeof globalThis & {
            prisma: PrismaClient;
        };

        if (!globalWithPrisma.prisma) {
            console.log('No existing PrismaClient found: creating new instance');
            globalWithPrisma.prisma = new PrismaClient({
                log: ['query', 'error', 'warn'],
                datasources: {
                    db: {
                        url: process.env.POSTGRES_URL_NON_POOLING // Use non-pooling connection to avoid prepared statement conflicts
                    }
                }
            });
        } else {
            console.log('Reusing existing PrismaClient instance');
        }

        prisma = globalWithPrisma.prisma;
    }

    console.log('Prisma client initialized successfully');
} else {
    // This is on the client side
    console.log('Attempted to initialize Prisma client on client side');
    // Throw a meaningful error if someone tries to use PrismaClient
    throw new Error(
        'PrismaClient cannot be used on the client side. Use server components or API routes instead.'
    );
}

export { prisma };
export default prisma; 