export interface Listing {
    id: string;
    title: string;
    description: string;
    imageSrc: string;
    createdAt: Date;
    category: string;
    roomCount: number;
    bathroomCount: number;
    guestCount: number;
    locationValue: string;
    userId: string;
    price: number;
}

export interface User {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    password: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Reservation {
    id: string;
    userId: string;
    listingId: string;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    createdAt: Date;
}

export interface Favorite {
    id: string;
    userId: string;
    listingId: string;
}

export interface Account {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
} 