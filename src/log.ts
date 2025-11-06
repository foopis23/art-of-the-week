import { createPinoLogger } from '@bogeychan/elysia-logger'

export const log = createPinoLogger({
  level: 'info',
  transport: {
    target: 'pino-pretty',
  },
})
