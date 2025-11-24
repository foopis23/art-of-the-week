#!/bin/sh
set -e

echo "Starting bot..."
# Use exec so Bun becomes PID 1 and receives signals directly
exec bun run src/index.ts
