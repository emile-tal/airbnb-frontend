import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Simple check to demonstrate the API is reachable
export async function GET(request: Request) {
    try {
        console.log('API Route: GET /api/listings - Starting request');

        // Get all listings without doing a count first
        const listings = await prisma.listing.findMany();
        console.log(`API Route: Successfully fetched ${listings.length} listings`);

        // Return success response
        return NextResponse.json(listings);
    } catch (error) {
        console.error("API Route: Error fetching listings:", error);

        if (error instanceof Error) {
            console.error("API Route: Error message:", error.message);
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
        const body = await request.json();
        console.log('API Route: Creating new listing with data:', body);

        const listing = await prisma.listing.create({
            data: body,
        });

        console.log('API Route: Successfully created listing with ID:', listing.id);
        return NextResponse.json(listing);
    } catch (error) {
        console.error("API Route: Error creating listing:", error);

        return NextResponse.json(
            { error: "Failed to create listing", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 