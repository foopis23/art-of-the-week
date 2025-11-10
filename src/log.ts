import { env } from '@/env'
import pino from 'pino'

export const log = pino({
  level: env.NODE_ENV === 'development' ? 'info' : 'info',
  transport: {
    target: 'pino-pretty',
  },
})
