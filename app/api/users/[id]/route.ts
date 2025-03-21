import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: Request, context: RouteParams) {
    const { params } = context;
    const { id } = params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function PATCH(request: Request, context: RouteParams) {
    const { params } = context;
    const { id } = params;

    try {
        const body = await request.json();
        const user = await prisma.user.update({
            where: { id: id },
            data: body,
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
} 