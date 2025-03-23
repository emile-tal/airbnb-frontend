import { NextResponse } from 'next/server';
import { adminGetAllUsers } from '@/lib/admin-utils';
import { authOptions } from '../../auth/[...nextauth]/route';
import { checkIfUserIsAdmin } from '@/lib/secure-prisma';
import { getServerSession } from 'next-auth';

// Admin-only API endpoint to get all users
export async function GET() {
    try {
        // Get the current session
        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized", message: "You must be logged in to access this resource" },
                { status: 401 }
            );
        }

        // Check if the user is an admin
        const isAdmin = checkIfUserIsAdmin(session.user.id);
        if (!isAdmin) {
            return NextResponse.json(
                { error: "Forbidden", message: "Admin access required" },
                { status: 403 }
            );
        }

        // Get all users using admin privileges (bypasses RLS)
        const users = await adminGetAllUsers();

        return NextResponse.json(users);
    } catch (error) {
        console.error("Admin API error:", error);
        return NextResponse.json(
            { error: "Server error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
} 