# Row-Level Security (RLS) Implementation

This document explains how Row-Level Security (RLS) is implemented in this Airbnb clone application to provide data isolation and security at the database level.

## What is Row-Level Security?

Row-Level Security (RLS) is a feature in PostgreSQL that allows tables to restrict which rows can be retrieved, modified, or deleted based on the user executing the query. It provides an additional layer of security by enforcing access policies directly at the database level.

## How RLS Works in This Application

1. **Policy-Based Security**: Each table has specific policies that define who can read, create, update, or delete rows.
2. **User Context**: Every database operation is executed within the context of the current user.
3. **Transparent to the Application**: The security rules are enforced automatically by the database.

## Implementation Details

### 1. Database Setup

The `prisma/migrations/rls_setup_migration.sql` file contains SQL commands that:

- Enable RLS on all tables
- Create helper functions for user identification
- Define table-specific policies

### 2. Secure Prisma Client

The `lib/secure-prisma.ts` file creates an extended Prisma client that:

- Sets the user context before each database operation
- Resets the context after each operation
- Provides ways to use admin privileges when necessary

### 3. User Session Integration

Database operations automatically use the current user's session to:

- Identify who is making the request
- Apply appropriate access controls
- Ensure users can only access their own data

## Security Policies

The following policies are implemented:

### User Table
- Anyone can read user profiles
- Users can only update their own profile

### Listing Table
- Anyone can view listings
- Users can only create/update/delete their own listings
- Admins can manage any listing

### Reservation Table
- Users can see their own reservations and reservations for listings they own
- Users can only create/update/delete their own reservations
- Admins can manage any reservation

### Favorite Table
- Users can only see and manage their own favorites
- Admins can see all favorites

### Listing Availability
- Anyone can view availability
- Only listing owners can modify availability
- Admins can manage any availability

### Account Table
- Users can only see and modify their own account data
- Admins can manage any account

## Admin Functionality

The `lib/admin-utils.ts` file provides utilities for administrative operations that bypass RLS:

- `withAdminAccess`: A helper to run operations with admin privileges
- `adminGetAllUsers`: Get all users in the system
- `adminCreateListing`: Create listings as an admin

## How to Apply RLS

Run the following command to set up RLS on your database:

```
npm run db:setup-rls
```

## Security Considerations

1. **Always use the secure client**: Import from `lib/secure-prisma.ts` instead of using the base Prisma client
2. **Test carefully**: Ensure policies are working as expected
3. **Admin access**: Use admin utilities only when absolutely necessary
4. **Audit regularly**: Monitor database access patterns for unusual activity

## Troubleshooting

If you encounter permission errors, they might be due to:

1. Attempting to access data not owned by the current user
2. Missing user context in the request
3. Incorrect policy configuration

Review the error messages and check that the user context is being set correctly. 