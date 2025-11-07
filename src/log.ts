import pino from 'pino'

export const log = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
  },
})
