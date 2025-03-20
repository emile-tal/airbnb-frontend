const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting to update reservation statuses...');

        // Update all existing reservations to 'accepted' status
        const updateResult = await prisma.reservation.updateMany({
            data: {
                status: 'accepted'
            }
        });

        console.log(`Updated ${updateResult.count} reservations to 'accepted' status`);
        console.log('Update completed successfully');
    } catch (error) {
        console.error('Error updating reservation statuses:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    }); 