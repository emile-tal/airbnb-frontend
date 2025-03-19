import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized: ({ req, token }) => {
            // Allow public access to the landing page and API routes
            if (req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/api/")) {
                return true;
            }
            // Require authentication for protected routes
            return !!token;
        },
    },
});

export const config = {
    matcher: [
        "/listings/create",
        "/listings/:path*/edit",
        "/reservations/:path*",
        "/favorites/:path*",
    ],
}; 