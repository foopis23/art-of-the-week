import { Elysia } from 'elysia'
import { env } from './env'
import { log } from './log'
import { discord } from './modules/discord'

new Elysia()
  .use(log.into())
  .use(
    new Elysia({
      prefix: '/api/v1',
    }).use(discord),
  )
  .listen(
    {
      hostname: env.HOSTNAME,
      port: env.PORT,
    },
    (server) => {
      log.info(`Server is running on ${server.url}`)
    },
  )
