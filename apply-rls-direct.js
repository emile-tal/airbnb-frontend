#!/usr/bin/env node

// Import necessary modules
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get database connection details
const dbUrl = process.env.POSTGRES_URL_NON_POOLING;
if (!dbUrl) {
    console.error('Error: POSTGRES_URL_NON_POOLING environment variable is not set.');
    process.exit(1);
}

// Extract database info from connection string
const dbRegex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
const match = dbUrl.match(dbRegex);

if (!match) {
    console.error('Error: Could not parse database connection string.');
    process.exit(1);
}

const [, user, password, host, port, database] = match;

console.log('Setting up Row-Level Security for database...');
console.log(`Connecting to database ${database} on ${host}:${port}...`);

// Path to SQL file
const sqlFilePath = path.join(__dirname, '../rls-setup.sql');

// Command to execute the SQL file
const command = `PGPASSWORD="${password}" psql -h ${host} -p ${port} -U ${user} -d ${database} -f ${sqlFilePath}`;

// Execute the command
exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error('Error executing SQL file:', error);
        console.error(stderr);
        process.exit(1);
    }

    console.log(stdout);
    console.log('RLS setup completed successfully.');
    console.log('Your database is now protected with row-level security.');
    console.log('All API operations will now respect user permissions.');
}); 