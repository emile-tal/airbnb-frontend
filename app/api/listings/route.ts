import { checkDatabaseConnection, prisma } from '../../../lib/prisma';

import { Listing } from '@prisma/client';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

// Simple check to demonstrate the API is reachable
export async function GET(request: Request) {
    try {
        console.log('API Route: GET /api/listings - Starting request');

        // Ensure Prisma is properly initialized
        if (!prisma) {
            console.error('API Route: Prisma client is not initialized');
            return NextResponse.json(
                { error: "Database connection error", message: "Database client is not initialized" },
                { status: 500 }
            );
        }

        try {
            console.log('API Route: Attempting to fetch listings...');

            // Connect to the database first
            await prisma.$connect();

            // Simple query approach with no special options
            const listings = await prisma.listing.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });

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

        // Connect to database first
        try {
            await prisma.$connect();
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
        try {
            const listing = await prisma.listing.create({
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
            }

            return NextResponse.json(
                { error: "Database error", message: dbError instanceof Error ? dbError.message : String(dbError) },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("API Route: Error creating listing:", error);

        if (error instanceof Error) {
            console.error("API Route: Error message:", error.message);
            console.error("API Route: Error stack:", error.stack);
        }

        return NextResponse.json(
            { error: "Failed to create listing", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 