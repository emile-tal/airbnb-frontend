import prisma, { reconnectDatabase } from "@/lib/prisma";

import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function POST() {
    try {
        console.log('API Route: POST /api/debug/reset-db-connection - Starting request');

        // Check if user is authenticated (optional security measure)
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            console.log('API Route: Unauthenticated user attempting to reset DB connection');
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            );
        }

        console.log('API Route: Attempting to reset database connection');

        // Explicitly disconnect
        await prisma.$disconnect();
        console.log('API Route: Disconnected from database');

        // Wait a moment to ensure complete disconnect
        await new Promise(resolve => setTimeout(resolve, 500));

        // Reconnect using the helper function
        const reconnected = await reconnectDatabase();

        if (reconnected) {
            console.log('API Route: Successfully reset database connection');

            // Test the connection with a simple query
            try {
                const userCount = await prisma.user.count();
                return NextResponse.json({
                    success: true,
                    message: "Database connection reset successfully",
                    connectionTest: {
                        successful: true,
                        userCount
                    }
                });
            } catch (queryError) {
                console.error('API Route: Connection reset succeeded but test query failed:', queryError);
                return NextResponse.json({
                    success: true,
                    message: "Database connection reset but test query failed",
                    connectionTest: {
                        successful: false,
                        error: queryError instanceof Error ? queryError.message : String(queryError)
                    }
                });
            }
        } else {
            console.error('API Route: Failed to reset database connection');
            return NextResponse.json(
                { success: false, message: "Failed to reset database connection" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("API Route: Error resetting database connection:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error resetting database connection",
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
} 