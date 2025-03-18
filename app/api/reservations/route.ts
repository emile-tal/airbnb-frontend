import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const listingId = searchParams.get('listingId');

        const whereClause: any = {};

        if (userId) {
            whereClause.userId = userId;
        }

        if (listingId) {
            whereClause.listingId = listingId;
        }

        const reservations = await prisma.reservation.findMany({
            where: whereClause,
        });

        return NextResponse.json(reservations);
    } catch (error) {
        console.error("Failed to fetch reservations:", error);
        return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const reservation = await prisma.reservation.create({
            data: body,
        });
        return NextResponse.json(reservation);
    } catch (error) {
        console.error("Failed to create reservation:", error);
        return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
    }
} 