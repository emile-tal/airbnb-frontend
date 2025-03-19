import prisma, { checkDatabaseConnection, executeWithRetry } from "@/lib/prisma";

import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        console.log('API Route: GET /api/listings/user - Starting request');

        const session = await getServerSession(authOptions);
        console.log('API Route: Session received:', session ? 'Valid session' : 'No session');

        if (session?.user) {
            console.log('API Route: User in session:', {
                name: session.user.name,
                email: session.user.email,
                id: session.user.id || 'No ID found'
            });
        }

        if (!session) {
            console.log('API Route: No session found');
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        if (!session.user?.id) {
            console.log('API Route: Session exists but no user ID');

            // Try to find user by email as fallback
            if (session.user?.email) {
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

                        // Get user's listings with retry logic
                        const listings = await executeWithRetry(async () => {
                            return prisma.listing.findMany({
                                where: { userId: userByEmail.id },
                                orderBy: { createdAt: "desc" },
                            });
                        });

                        console.log(`API Route: Found ${listings.length} listings for user`);
                        return NextResponse.json(listings);
                    }
                } catch (dbError) {
                    console.error('API Route: Database error looking up user by email:', dbError);
                    return NextResponse.json(
                        { error: "Database error", message: "Failed to lookup user by email" },
                        { status: 500 }
                    );
                }
            }

            return NextResponse.json(
                { error: "Not authenticated", message: "No user ID in session" },
                { status: 401 }
            );
        }

        // Ensure database connection
        if (!prisma) {
            console.error('API Route: Prisma client is not initialized');
            return NextResponse.json(
                { error: "Database connection error", message: "Database client is not initialized" },
                { status: 500 }
            );
        }

        // Check database connection first
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
            console.error('API Route: Database connection check failed');
            return NextResponse.json(
                { error: "Database connection error", message: "Failed to connect to database" },
                { status: 500 }
            );
        }

        // Get user's listings directly using the ID from session with retry logic
        console.log(`API Route: Fetching listings for user ID: ${session.user.id}`);

        const listings = await executeWithRetry(async () => {
            return prisma.listing.findMany({
                where: {
                    userId: session.user!.id!,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        });

        console.log(`API Route: Found ${listings.length} listings for user`);
        return NextResponse.json(listings);
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