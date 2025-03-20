import prisma, { executeWithRetry } from '@/lib/prisma';

import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

// Get a specific reservation
export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const { params } = context;
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Reservation ID is required" },
                { status: 400 }
            );
        }

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Find the reservation
        const reservation = await prisma.reservation.findUnique({
            where: {
                id: id,
            },
            include: {
                listing: {
                    select: {
                        userId: true,
                        title: true,
                    },
                },
            },
        });

        if (!reservation) {
            return NextResponse.json(
                { error: "Reservation not found" },
                { status: 404 }
            );
        }

        // Only the reservation owner or listing owner can view the reservation
        if (reservation.userId !== user.id && reservation.listing.userId !== user.id) {
            return NextResponse.json(
                { error: "You don't have permission to access this reservation" },
                { status: 403 }
            );
        }

        return NextResponse.json(reservation);
    } catch (error) {
        console.error("Error fetching reservation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Update reservation status
export async function PATCH(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const { params } = context;
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Reservation ID is required" },
                { status: 400 }
            );
        }

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Find the reservation
        const reservation = await prisma.reservation.findUnique({
            where: {
                id: id,
            },
            include: {
                listing: true,
            },
        });

        if (!reservation) {
            return NextResponse.json(
                { error: "Reservation not found" },
                { status: 404 }
            );
        }

        // Only the listing owner can update the reservation status
        if (reservation.listing.userId !== user.id) {
            return NextResponse.json(
                { error: "You don't have permission to update this reservation" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { status } = body;

        // Validate status
        if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status value. Must be 'pending', 'accepted', or 'rejected'" },
                { status: 400 }
            );
        }

        // Update the reservation status
        const updatedReservation = await executeWithRetry(async () => {
            return prisma.reservation.update({
                where: {
                    id: id,
                },
                data: {
                    status: status as string,
                },
                include: {
                    listing: {
                        select: {
                            title: true,
                        },
                    },
                },
            });
        });

        return NextResponse.json(updatedReservation);
    } catch (error) {
        console.error("Error updating reservation status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 