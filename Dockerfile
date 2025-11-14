# Use official Bun image
FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application code
COPY tsconfig.json drizzle.config.ts ./
COPY src ./src

# Create data directory for SQLite database (with proper permissions)
RUN mkdir -p /app/data && chown -R bun:bun /app/data

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && chown bun:bun /app/docker-entrypoint.sh

# Set environment to production
ENV NODE_ENV=production

# Run the bot via entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]

