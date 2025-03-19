import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Starting database reset...');

    // Delete in the correct order to respect foreign key constraints
    console.log('Deleting Favorites...');
    await prisma.favorite.deleteMany({});

    console.log('Deleting Reservations...');
    await prisma.reservation.deleteMany({});

    console.log('Deleting Listings...');
    await prisma.listing.deleteMany({});

    console.log('Deleting Accounts...');
    await prisma.account.deleteMany({});

    console.log('Deleting Users...');
    await prisma.user.deleteMany({});

    console.log('✅ Database reset completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error resetting database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 