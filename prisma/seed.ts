const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    // Create a test user
    const passwordHash = await bcrypt.hash('password123', 12);

    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            name: 'Test User',
            password: passwordHash,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    console.log('Created user:', user);

    // Create some sample listings
    const listings = [
        {
            title: 'Luxury Beach House',
            description: 'Beautiful beachfront property with stunning ocean views. Perfect for a relaxing getaway with family or friends. Enjoy the sunset from your private patio.',
            imageSrc: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
            category: 'Beach',
            roomCount: 3,
            bathroomCount: 2,
            guestCount: 6,
            locationValue: 'Malibu, CA',
            userId: user.id,
            price: 250,
        },
        {
            title: 'Mountain Cabin Retreat',
            description: 'Cozy cabin nestled in the mountains. Perfect for hiking enthusiasts and nature lovers. Enjoy the peaceful surroundings and breathtaking views.',
            imageSrc: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606',
            category: 'Cabin',
            roomCount: 2,
            bathroomCount: 1,
            guestCount: 4,
            locationValue: 'Aspen, CO',
            userId: user.id,
            price: 175,
        },
        {
            title: 'Modern Downtown Apartment',
            description: 'Stylish apartment in the heart of the city. Walking distance to restaurants, shops, and attractions. Perfect for urban explorers.',
            imageSrc: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
            category: 'Apartment',
            roomCount: 1,
            bathroomCount: 1,
            guestCount: 2,
            locationValue: 'New York, NY',
            userId: user.id,
            price: 120,
        },
        {
            title: 'Countryside Villa',
            description: 'Spacious villa surrounded by scenic countryside. Enjoy the private pool and garden. Perfect for a family getaway.',
            imageSrc: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
            category: 'Countryside',
            roomCount: 4,
            bathroomCount: 3,
            guestCount: 8,
            locationValue: 'Tuscany, Italy',
            userId: user.id,
            price: 300,
        },
        {
            title: 'Lakefront Cottage',
            description: 'Charming cottage with direct access to the lake. Enjoy fishing, swimming, and boating. Perfect for a peaceful retreat.',
            imageSrc: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c',
            category: 'Luxury',
            roomCount: 2,
            bathroomCount: 1,
            guestCount: 4,
            locationValue: 'Lake Tahoe, CA',
            userId: user.id,
            price: 200,
        },
    ];

    for (const listing of listings) {
        const createdListing = await prisma.listing.upsert({
            where: {
                id: `seed-${listing.title.toLowerCase().replace(/\s+/g, '-')}`,
            },
            update: listing,
            create: {
                ...listing,
                id: `seed-${listing.title.toLowerCase().replace(/\s+/g, '-')}`,
                createdAt: new Date(),
            },
        });
        console.log('Created listing:', createdListing.title);

        // Create a sample reservation for the first listing
        if (listing === listings[0]) {
            const reservation = await prisma.reservation.create({
                data: {
                    userId: user.id,
                    listingId: createdListing.id,
                    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
                    totalPrice: listing.price * 7,
                    createdAt: new Date(),
                },
            });
            console.log('Created reservation:', reservation.id);
        }

        // Create a favorite for one of the listings
        if (listing === listings[1]) {
            const favorite = await prisma.favorite.create({
                data: {
                    userId: user.id,
                    listingId: createdListing.id,
                },
            });
            console.log('Created favorite:', favorite.id);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 