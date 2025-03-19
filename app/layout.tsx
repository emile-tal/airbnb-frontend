import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { NextAuthProvider } from "@/providers/NextAuthProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Airbnb Clone",
    description: "A modern Airbnb clone built with Next.js",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NextAuthProvider>
                    <Navbar />
                    <main>{children}</main>
                </NextAuthProvider>
            </body>
        </html>
    );
}
