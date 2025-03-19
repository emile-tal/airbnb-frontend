import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: Request, context: RouteParams) {
    // Properly destructure params to avoid direct access
    const { params } = context;
    const { id } = params;

    try {
        console.log(`API Route: GET /api/listings/${id} - Starting request`);

        const listing = await prisma.listing.findUnique({
            where: { id: id },
        });

        if (!listing) {
            console.log(`API Route: Listing with id ${id} not found`);
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        console.log(`API Route: Successfully fetched listing with id ${id}`);
        return NextResponse.json(listing);
    } catch (error) {
        console.error("API Route: Error fetching listing:", error);
        return NextResponse.json(
            { error: "Failed to fetch listing", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request, context: RouteParams) {
    // Properly destructure params to avoid direct access
    const { params } = context;
    const { id } = params;

    try {
        const body = await request.json();
        console.log(`API Route: Updating listing with id ${id}`);

        const listing = await prisma.listing.update({
            where: { id: id },
            data: body,
        });

        console.log(`API Route: Successfully updated listing with id ${id}`);
        return NextResponse.json(listing);
    } catch (error) {
        console.error("API Route: Error updating listing:", error);
        return NextResponse.json(
            { error: "Failed to update listing", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, context: RouteParams) {
    // Properly destructure params to avoid direct access
    const { params } = context;
    const { id } = params;

    try {
        console.log(`API Route: Deleting listing with id ${id}`);

        await prisma.listing.delete({
            where: { id: id },
        });

        console.log(`API Route: Successfully deleted listing with id ${id}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API Route: Error deleting listing:", error);
        return NextResponse.json(
            { error: "Failed to delete listing", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 