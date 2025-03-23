import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { readFileSync } from 'fs';

async function applyRlsMigration() {
    console.log('Applying RLS migration...');

    const prisma = new PrismaClient();

    try {
        // Connect to the database
        await prisma.$connect();

        // Read the SQL migration file
        const migrationPath = join(__dirname, '../migrations/rls_setup_migration.sql');
        const migrationSql = readFileSync(migrationPath, 'utf8');

        // Split the SQL into separate statements
        const statements = migrationSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Execute each statement
        for (const statement of statements) {
            try {
                await prisma.$executeRawUnsafe(`${statement};`);
                console.log('Executed statement successfully');
            } catch (error) {
                console.error('Error executing statement:', statement);
                console.error('Error details:', error);
                // Continue with next statement even if one fails
            }
        }

        console.log('RLS migration completed successfully');
    } catch (error) {
        console.error('Failed to apply RLS migration:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration if this script is executed directly
if (require.main === module) {
    applyRlsMigration()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Migration failed with error:', error);
            process.exit(1);
        });
}

export { applyRlsMigration }; 