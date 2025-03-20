import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        // Properly destructure params to avoid direct access
        const { params } = context;
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Listing ID is required" },
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

        // Find the listing
        const listing = await prisma.listing.findUnique({
            where: {
                id: id,
            },
        });

        if (!listing) {
            return NextResponse.json(
                { error: "Listing not found" },
                { status: 404 }
            );
        }

        // Check if the user owns the listing
        if (listing.userId !== user.id) {
            return NextResponse.json(
                { error: "You don't have permission to access this listing's reservations" },
                { status: 403 }
            );
        }

        // Get reservations for this listing
        const reservations = await prisma.reservation.findMany({
            where: {
                listingId: id,
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

        return NextResponse.json(reservations);
    } catch (error) {
        console.error("Error fetching listing reservations:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 