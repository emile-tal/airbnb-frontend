#!/usr/bin/env node

// This script updates the Row-Level Security (RLS) settings in PostgreSQL

console.log('Setting up Row-Level Security for database...');
console.log('This will configure RLS policies for all tables...');

// Load the apply-rls.js module directly (CommonJS version)
const { applyRlsMigration } = require('./apply-rls.js');

// Execute the migration function
applyRlsMigration()
    .then(() => {
        console.log('RLS setup completed successfully.');
        console.log('Your database is now protected with row-level security.');
        console.log('All API operations will now respect user permissions.');
        process.exit(0);
    })
    .catch(error => {
        console.error('RLS setup failed with error:', error);
        console.error('Please check the error messages above for more information.');
        process.exit(1);
    }); 