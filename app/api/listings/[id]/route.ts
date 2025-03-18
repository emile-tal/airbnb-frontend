import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        console.log(`API Route: GET /api/listings/${params.id} - Starting request`);

        const listing = await prisma.listing.findUnique({
            where: { id: params.id },
        });

        if (!listing) {
            console.log(`API Route: Listing with id ${params.id} not found`);
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        console.log(`API Route: Successfully fetched listing with id ${params.id}`);
        return NextResponse.json(listing);
    } catch (error) {
        console.error("API Route: Error fetching listing:", error);
        return NextResponse.json(
            { error: "Failed to fetch listing", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const body = await request.json();
        console.log(`API Route: Updating listing with id ${params.id}`);

        const listing = await prisma.listing.update({
            where: { id: params.id },
            data: body,
        });

        console.log(`API Route: Successfully updated listing with id ${params.id}`);
        return NextResponse.json(listing);
    } catch (error) {
        console.error("API Route: Error updating listing:", error);
        return NextResponse.json(
            { error: "Failed to update listing", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        console.log(`API Route: Deleting listing with id ${params.id}`);

        await prisma.listing.delete({
            where: { id: params.id },
        });

        console.log(`API Route: Successfully deleted listing with id ${params.id}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API Route: Error deleting listing:", error);
        return NextResponse.json(
            { error: "Failed to delete listing", message: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
} 