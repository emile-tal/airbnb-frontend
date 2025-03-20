import prisma, { executeWithRetry } from "@/lib/prisma";

import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
    try {
        console.log('API Route: POST /api/reservations/host - Starting request');

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            console.log('API Route: No authenticated user for reservations');
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        console.log('API Route: Finding user for reservations');
        // Find the user with retry logic
        const user = await executeWithRetry(async () => {
            return prisma.user.findUnique({
                where: {
                    email: session.user!.email!,
                },
            });
        });

        if (!user) {
            console.log('API Route: User not found for reservations');
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { listingIds } = body;

        console.log(`API Route: Validating listing IDs for reservations: ${JSON.stringify(listingIds)}`);
        if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
            console.log('API Route: Invalid listing IDs provided for reservations');
            return NextResponse.json(
                { error: "Invalid listing IDs provided" },
                { status: 400 }
            );
        }

        console.log('API Route: Verifying listings ownership');
        // First, verify that all these listings belong to the user with retry logic
        const userListings = await executeWithRetry(async () => {
            return prisma.listing.findMany({
                where: {
                    id: { in: listingIds },
                    userId: user.id,
                },
                select: { id: true },
            });
        });

        const verifiedListingIds = userListings.map(listing => listing.id);
        console.log(`API Route: Verified ${verifiedListingIds.length} listings out of ${listingIds.length} requested`);

        if (verifiedListingIds.length === 0) {
            console.log('API Route: No verified listings found, returning empty array');
            return NextResponse.json([]);
        }

        console.log('API Route: Fetching reservations for verified listings');
        // Get reservations for verified listings with retry logic
        const reservations = await executeWithRetry(async () => {
            return prisma.reservation.findMany({
                where: {
                    listingId: { in: verifiedListingIds },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                },
                orderBy: {
                    startDate: "asc",
                },
            });
        });

        console.log(`API Route: Found ${reservations.length} reservations`);
        return NextResponse.json(reservations);
    } catch (error) {
        console.error("API Route: Error fetching host reservations:", error);
        if (error instanceof Error) {
            console.error("API Route: Error details:", {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        }
        return NextResponse.json(
            { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 