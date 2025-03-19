import prisma, { reconnectDatabase } from "@/lib/prisma";

import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        try {
            // Find the user
            const user = await prisma.user.findUnique({
                where: {
                    email: session.user.email
                }
            });

            if (!user) {
                return NextResponse.json(
                    { error: "User not found" },
                    { status: 404 }
                );
            }

            // Count user's listings
            const listingsCount = await prisma.listing.count({
                where: {
                    userId: user.id
                }
            });

            return NextResponse.json({ hasListings: listingsCount > 0 });

        } catch (dbError) {
            console.error("Database error:", dbError);

            // Try to reconnect and retry the operation once
            const reconnected = await reconnectDatabase();
            if (reconnected) {
                // Retry the operation after reconnection
                const user = await prisma.user.findUnique({
                    where: {
                        email: session.user.email
                    }
                });

                if (!user) {
                    return NextResponse.json(
                        { error: "User not found" },
                        { status: 404 }
                    );
                }

                const listingsCount = await prisma.listing.count({
                    where: {
                        userId: user.id
                    }
                });

                return NextResponse.json({ hasListings: listingsCount > 0 });
            } else {
                throw new Error("Failed to reconnect to database");
            }
        }
    } catch (error) {
        console.error("Error checking user listings:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 