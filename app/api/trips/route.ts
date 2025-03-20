import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// Get all trips (reservations) for the current user
export async function GET() {
    try {
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

        // Find all reservations made by the user
        const trips = await prisma.reservation.findMany({
            where: {
                userId: user.id,
            },
            include: {
                listing: {
                    select: {
                        id: true,
                        title: true,
                        imageSrc: true,
                        locationValue: true,
                        category: true,
                        userId: true,
                    },
                },
            },
            orderBy: {
                startDate: 'asc',
            },
        });

        return NextResponse.json(trips);
    } catch (error) {
        console.error("Error fetching user trips:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 