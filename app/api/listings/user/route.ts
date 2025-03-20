import prisma, { checkDatabaseConnection, executeWithRetry } from "@/lib/prisma";

import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        console.log('API Route: GET /api/listings/user - Starting request');

        // Ensure database connection is active
        await checkDatabaseConnection();

        const session = await getServerSession(authOptions);
        console.log('API Route: Session received:', session ? 'Valid session' : 'No session');

        if (!session) {
            console.log('API Route: No session found');
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        console.log('API Route: Session user:', {
            name: session.user?.name || 'N/A',
            email: session.user?.email || 'N/A',
            id: session.user?.id || 'No ID found'
        });

        // If we don't have a user ID but we have an email, try to find the user by email
        let userId = session.user?.id;

        // We need either a user ID or an email to proceed
        if (!userId && !session.user?.email) {
            console.log('API Route: No user ID or email found in session');
            return NextResponse.json(
                { error: "Invalid session data", message: "User ID or email is required" },
                { status: 400 }
            );
        }

        // If we don't have a userId but have an email, look up the user by email
        if (!userId && session.user?.email) {
            console.log('API Route: Looking up user by email instead');

            try {
                // Find the user by email with retry logic
                const userByEmail = await executeWithRetry(async () => {
                    return prisma.user.findUnique({
                        where: { email: session.user!.email! },
                        select: { id: true }
                    });
                });

                if (userByEmail) {
                    console.log(`API Route: Found user by email with ID: ${userByEmail.id}`);
                    userId = userByEmail.id;
                } else {
                    console.log('API Route: User not found by email');
                    return NextResponse.json(
                        { error: "User not found", message: "No user found with this email" },
                        { status: 404 }
                    );
                }
            } catch (dbError) {
                console.error('API Route: Database error looking up user by email:', dbError);
                return NextResponse.json(
                    { error: "Database error", message: "Failed to lookup user by email" },
                    { status: 500 }
                );
            }
        }

        // At this point we should have a userId
        if (!userId) {
            console.log('API Route: Failed to determine user ID');
            return NextResponse.json(
                { error: "Authentication error", message: "Could not determine user ID" },
                { status: 401 }
            );
        }

        // Get user's listings with retry logic
        console.log(`API Route: Fetching listings for user ID: ${userId}`);

        try {
            const listings = await executeWithRetry(async () => {
                return prisma.listing.findMany({
                    where: { userId: userId! },
                    orderBy: { createdAt: "desc" },
                });
            });

            console.log(`API Route: Found ${listings.length} listings for user`);
            return NextResponse.json(listings);
        } catch (error) {
            console.error("API Route: Error fetching listings:", error);
            return NextResponse.json(
                { error: "Database error", message: "Failed to fetch listings" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("API Route: Error fetching user listings:", error);
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