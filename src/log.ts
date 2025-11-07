import pino from 'pino'
import { env } from './env'

export const log = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: {
    target: 'pino-pretty',
  },
})
