import z from 'zod'

export const env = z
  .object({
    DISCORD_TOKEN: z.string('DISCORD_TOKEN is required').min(1, 'DISCORD_TOKEN is required'),
    DISCORD_CLIENT_ID: z
      .string('DISCORD_CLIENT_ID is required')
      .min(1, 'DISCORD_CLIENT_ID is required')
      .transform((value) => value.toLowerCase()),
    DISCORD_PUBLIC_KEY: z
      .string('DISCORD_PUBLIC_KEY is required')
      .min(1, 'DISCORD_PUBLIC_KEY is required')
      .transform((value) => value.toLowerCase()),
    DISCORD_TESTING_GUILD_ID: z.string().optional(),
    DB_FILE_NAME: z.string('DB_FILE_NAME is required').min(1, 'DB_FILE_NAME is required'),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    GOOGLE_ACCESS_TOKEN: z
      .string('GOOGLE_ACCESS_TOKEN is required')
      .min(1, 'GOOGLE_ACCESS_TOKEN is required'),
    GOOGLE_CLIENT_CREDENTIALS: z
      .string('GOOGLE_CLIENT_CREDENTIALS is required')
      .min(1, 'GOOGLE_CLIENT_CREDENTIALS is required'),
    SENTRY_DSN: z.string().optional(),
  })
  .parse(process.env)
