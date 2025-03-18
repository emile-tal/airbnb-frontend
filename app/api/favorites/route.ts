import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId },
        });

        return NextResponse.json(favorites);
    } catch (error) {
        console.error("Failed to fetch favorites:", error);
        return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, listingId } = body;

        if (!userId || !listingId) {
            return NextResponse.json({ error: "User ID and Listing ID are required" }, { status: 400 });
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId,
                listingId,
            },
        });

        return NextResponse.json(favorite);
    } catch (error) {
        console.error("Failed to add favorite:", error);
        return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const listingId = searchParams.get('listingId');

        if (!userId || !listingId) {
            return NextResponse.json({ error: "User ID and Listing ID are required" }, { status: 400 });
        }

        await prisma.favorite.deleteMany({
            where: {
                userId,
                listingId,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Failed to remove favorite:", error);
        return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
    }
} 