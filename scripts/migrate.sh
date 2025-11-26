#!/bin/bash

# Production database migration script

echo "Running database migrations..."

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

echo "Migrations completed!"

