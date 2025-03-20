import { checkDatabaseConnection, prisma } from '../../../lib/prisma';

import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

// Ensure TypeScript knows about our models
type PrismaClientWithModels = PrismaClient & {
    listingAvailability: any;
};

// Type assertion to tell TypeScript that prisma has the listingAvailability property
const prismaWithAvailability = prisma as unknown as PrismaClientWithModels;

// GET request handler to get all availabilities
export async function GET(
    req: Request
) {
    try {
        const listingId = new URL(req.url).searchParams.get('listingId');

        if (!listingId) {
            return NextResponse.json(
                { error: "Missing listingId parameter" },
                { status: 400 }
            );
        }

        // Get availabilities for a specific listing
        const availabilities = await prismaWithAvailability.listingAvailability.findMany({
            where: {
                listingId
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        return NextResponse.json(availabilities);
    } catch (error) {
        console.error('Error in GET /api/availability:', error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST request handler to create a new availability
export async function POST(
    req: Request
) {
    try {
        // Get current user from session
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { listingId, startDate, endDate } = body;

        if (!listingId || !startDate || !endDate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get current user ID
        const currentUser = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Verify the listing belongs to the current user
        const listing = await prisma.listing.findUnique({
            where: {
                id: listingId
            }
        });

        if (!listing || listing.userId !== currentUser.id) {
            return NextResponse.json(
                { error: "Unauthorized to update this listing" },
                { status: 403 }
            );
        }

        // Convert string dates to Date objects
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        // Check if dates are valid
        if (parsedEndDate <= parsedStartDate) {
            return NextResponse.json(
                { error: "End date must be after start date" },
                { status: 400 }
            );
        }

        // Check for overlapping availability periods
        const overlappingAvailability = await prismaWithAvailability.listingAvailability.findFirst({
            where: {
                listingId,
                OR: [
                    {
                        // New availability starts within existing availability
                        AND: [
                            { startDate: { lte: parsedStartDate } },
                            { endDate: { gte: parsedStartDate } }
                        ]
                    },
                    {
                        // New availability ends within existing availability
                        AND: [
                            { startDate: { lte: parsedEndDate } },
                            { endDate: { gte: parsedEndDate } }
                        ]
                    },
                    {
                        // New availability contains existing availability
                        AND: [
                            { startDate: { gte: parsedStartDate } },
                            { endDate: { lte: parsedEndDate } }
                        ]
                    }
                ]
            }
        });

        if (overlappingAvailability) {
            return NextResponse.json(
                { error: "Overlapping availability periods are not allowed" },
                { status: 400 }
            );
        }

        // Create the new availability
        const availability = await prismaWithAvailability.listingAvailability.create({
            data: {
                listingId,
                startDate: parsedStartDate,
                endDate: parsedEndDate
            }
        });

        return NextResponse.json(availability);
    } catch (error) {
        console.error('Error in POST /api/availability:', error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 