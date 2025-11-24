import { env } from '@/env'
import pino from 'pino'

const devTransport = {
  target: 'pino-pretty',
}

const prodTransport = env.SENTRY_DSN
  ? {
      target: 'pino-sentry-transport',
      options: {
        sentry: {
          dsn: env.SENTRY_DSN,
        },
      },
    }
  : undefined

export const log = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: env.NODE_ENV === 'development' ? devTransport : prodTransport,
})
