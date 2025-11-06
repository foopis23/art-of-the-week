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
    PORT: z.string().min(1, 'PORT is required').default('3000').transform(Number),
    HOSTNAME: z
      .string()
      .default('0.0.0.0')
      .transform((value) => value.toLowerCase()),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
  })
  .parse(process.env)
