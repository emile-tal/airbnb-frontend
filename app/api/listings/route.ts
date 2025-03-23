import { checkDatabaseConnection, executeWithRetry } from '../../../lib/prisma';

import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';
import { createPrismaFromSession } from '../../../lib/secure-prisma';
import { getServerSession } from 'next-auth';

// Simple check to demonstrate the API is reachable
export async function GET(_request: Request) {
    try {
        console.log('API Route: GET /api/listings - Starting request');

        // Get the user session for RLS
        const session = await getServerSession(authOptions);

        // Create a secure Prisma client with the user's context
        const securePrisma = createPrismaFromSession(session);

        // Ensure Prisma is properly initialized
        if (!securePrisma) {
            console.error('API Route: Prisma client is not initialized');
            return NextResponse.json(
                { error: "Database connection error", message: "Database client is not initialized" },
                { status: 500 }
            );
        }

        try {
            console.log('API Route: Attempting to fetch listings...');

            // Check database connection first
            const isConnected = await checkDatabaseConnection();
            if (!isConnected) {
                console.error('API Route: Database connection check failed');
                // Try to reconnect the database
                await securePrisma.$disconnect();
                await securePrisma.$connect();

                // Check again after reconnection attempt
                const reconnected = await checkDatabaseConnection();
                if (!reconnected) {
                    return NextResponse.json(
                        { error: "Database connection error", message: "Failed to connect to database" },
                        { status: 500 }
                    );
                }
            }

            // Use executeWithRetry for more robust database operations
            // RLS will be automatically applied based on the user context
            const listings = await executeWithRetry(() => securePrisma.listing.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            }));

            console.log(`API Route: Successfully fetched ${listings.length} listings`);

            // Return success response
            return NextResponse.json(listings);
        } catch (dbError) {
            console.error("API Route: Database error when fetching listings:", dbError);
            if (dbError instanceof Error) {
                console.error("API Route: Database error details:", {
                    message: dbError.message,
                    stack: dbError.stack,
                    name: dbError.name
                });
            }

            return NextResponse.json(
                { error: "Database error", message: dbError instanceof Error ? dbError.message : String(dbError) },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("API Route: Error fetching listings:", error);

        if (error instanceof Error) {
            console.error("API Route: Error message:", error.message);
            console.error("API Route: Error stack:", error.stack);
            console.error("API Route: Error name:", error.name);
        }

        // Return error response
        return NextResponse.json(
            { error: "Failed to fetch listings", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized", message: "You must be logged in to create a listing" },
                { status: 401 }
            );
        }

        // Create a secure Prisma client with the user's context
        const securePrisma = createPrismaFromSession(session);

        // Connect to database first
        try {
            await securePrisma.$connect();
        } catch (connectError) {
            console.error('API Route: Failed to connect to database:', connectError);
            return NextResponse.json(
                { error: "Database connection error", message: "Could not connect to database" },
                { status: 500 }
            );
        }

        // Parse request body with error handling
        let body;
        try {
            body = await request.json();
            console.log('API Route: Creating new listing with data:', body);
        } catch (parseError) {
            console.error('API Route: Failed to parse request body:', parseError);
            return NextResponse.json(
                { error: "Invalid request", message: "Failed to parse request body" },
                { status: 400 }
            );
        }

        // Validate required fields
        const requiredFields = ['title', 'description', 'imageSrc', 'category', 'roomCount',
            'bathroomCount', 'guestCount', 'locationValue', 'price'];

        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            console.error('API Route: Missing required fields:', missingFields);
            return NextResponse.json(
                { error: "Invalid request", message: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Create the listing with detailed error handling
        // RLS will ensure only authorized operations are allowed
        try {
            const listing = await securePrisma.listing.create({
                data: {
                    ...body,
                    userId: session.user.id,
                }
            });

            console.log('API Route: Successfully created listing with ID:', listing.id);
            return NextResponse.json(listing);
        } catch (dbError: unknown) {
            console.error("API Route: Database error when creating listing:", dbError);

            // Check for specific Prisma errors
            if (typeof dbError === 'object' && dbError !== null && 'code' in dbError) {
                console.error("API Route: Prisma error code:", (dbError as { code: string }).code);

                // Handle permission errors from RLS
                if ((dbError as any).code === 'P2025' ||
                    ((dbError instanceof Error) && dbError.message.includes('permission denied'))) {
                    return NextResponse.json(
                        { error: "Permission denied", message: "You don't have permission to perform this action" },
                        { status: 403 }
                    );
                }
            }

            return NextResponse.json(
                { error: "Database error", message: dbError instanceof Error ? dbError.message : String(dbError) },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("API Route: Error creating listing:", error);
        return NextResponse.json(
            { error: "Failed to create listing", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 