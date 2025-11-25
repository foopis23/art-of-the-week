import { log } from '@/log'
import { serve } from 'inngest/bun'
import { functions } from './functions'
import { inngest } from './inngest'

export abstract class InngestService {
  static async start() {
    const server = Bun.serve({
      port: 3000,
      routes: {
        '/api/inngest': serve({ client: inngest, functions }),
      },
    })
    log.info(
      { port: server.port, hostname: server.hostname, url: server.url },
      'Inngest service started',
    )
  }
}
