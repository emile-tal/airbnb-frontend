import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../lib/prisma';

// Ensure TypeScript knows about our models
type PrismaClientWithModels = PrismaClient & {
    listingAvailability: any;
};

// Type assertion to tell TypeScript that prisma has the listingAvailability property
const prismaWithAvailability = prisma as unknown as PrismaClientWithModels;

// DELETE request handler to delete a specific availability entry
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
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

        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Missing availability ID" },
                { status: 400 }
            );
        }

        // Get the availability entry
        const availability = await prismaWithAvailability.listingAvailability.findUnique({
            where: {
                id
            },
            include: {
                listing: true
            }
        });

        if (!availability) {
            return NextResponse.json(
                { error: "Availability entry not found" },
                { status: 404 }
            );
        }

        // Get current user
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
        if (availability.listing.userId !== currentUser.id) {
            return NextResponse.json(
                { error: "Unauthorized to delete this availability entry" },
                { status: 403 }
            );
        }

        // Delete the availability entry
        await prismaWithAvailability.listingAvailability.delete({
            where: {
                id
            }
        });

        return NextResponse.json({ message: "Availability entry deleted successfully" });
    } catch (error) {
        console.error('Error in DELETE /api/availability/[id]:', error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 