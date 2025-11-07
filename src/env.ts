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
    NODE_ENV: z.enum(['development', 'production']).default('development'),
  })
  .parse(process.env)
