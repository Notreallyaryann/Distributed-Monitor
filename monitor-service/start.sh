#!/bin/sh

# Default environment variables
DIRECT_URL=${DIRECT_URL:-$DATABASE_URL}

echo "Running database migrations..."
node src/migrate.js

echo "Starting server..."
npm run dev
