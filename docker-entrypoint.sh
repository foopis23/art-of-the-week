#!/bin/sh
set -e

echo "Running database migrations..."
bunx drizzle-kit push

echo "Starting bot..."
exec bun run src/index.ts

