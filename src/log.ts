import { env } from '@/env'
import pino from 'pino'

const devTransport = {
  target: 'pino-pretty',
}

export const log = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: env.NODE_ENV === 'development' ? devTransport : undefined,
})
