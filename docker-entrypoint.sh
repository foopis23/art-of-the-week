#!/bin/sh
set -e

echo "Running database migrations..."
bunx drizzle-kit push || {
    echo "Warning: Database migration failed, but continuing..."
}

echo "Starting bot..."
# Use exec so Bun becomes PID 1 and receives signals directly
exec bun run src/index.ts

