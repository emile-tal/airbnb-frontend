import { checkDatabaseConnection, executeWithRetry, prisma } from '../../../lib/prisma';

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const listingId = searchParams.get('listingId');

        const whereClause: Prisma.ReservationWhereInput = {};

        if (userId) {
            whereClause.userId = userId;
        }

        if (listingId) {
            whereClause.listingId = listingId;
        }

        // Check database connection first
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
            console.error('API Route: Database connection check failed for reservations');
            // Try to reconnect the database
            await prisma.$disconnect();
            await prisma.$connect();

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
        const reservations = await executeWithRetry(() => prisma.reservation.findMany({
            where: whereClause,
            include: {
                listing: true
            }
        }));

        return NextResponse.json(reservations);
    } catch (error) {
        console.error("Failed to fetch reservations:", error);
        return NextResponse.json({
            error: "Failed to fetch reservations",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Check database connection first
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
            console.error('API Route: Database connection check failed for creating reservation');
            // Try to reconnect the database
            await prisma.$disconnect();
            await prisma.$connect();

            // Check again after reconnection attempt
            const reconnected = await checkDatabaseConnection();
            if (!reconnected) {
                return NextResponse.json(
                    { error: "Database connection error", message: "Failed to connect to database" },
                    { status: 500 }
                );
            }
        }

        // Validate required fields
        const requiredFields = ['listingId', 'userId', 'startDate', 'endDate', 'totalPrice'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json({
                error: "Invalid request",
                message: `Missing required fields: ${missingFields.join(', ')}`
            }, { status: 400 });
        }

        // Use executeWithRetry for more robust database operations
        const reservation = await executeWithRetry(() => prisma.reservation.create({
            data: body,
        }));

        return NextResponse.json(reservation);
    } catch (error) {
        console.error("Failed to create reservation:", error);

        // Check for specific Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json({
                    error: "Reservation conflict",
                    message: "This reservation conflicts with an existing one"
                }, { status: 409 });
            }
            if (error.code === 'P2003') {
                return NextResponse.json({
                    error: "Foreign key constraint failed",
                    message: "The listing or user specified does not exist"
                }, { status: 400 });
            }
        }

        return NextResponse.json({
            error: "Failed to create reservation",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 