import { env } from '@/env'
import { log } from '@/log'
import * as Sentry from '@sentry/node'
import { program } from 'commander'
import pkg from '../package.json'
import { migrate } from './db'
import { BotService } from './modules/bot/service'
import { InngestService } from './modules/inngest/service'

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations: [Sentry.pinoIntegration()],
    enableLogs: env.NODE_ENV === 'production',
  })
}

program
  .name('art-of-the-week')
  .description('A discord bot for the Art of the Week project')
  .version(pkg.version, '-v, --version', 'Display the version')
  .action(async () => {
    await BotService.start()
    await InngestService.start()
  })

program
  .command('deploy')
  .description('Deploy commands')
  .action(async () => {
    try {
      await BotService.deployCommands()
    } catch (error) {
      log.error(error, 'Error refreshing application (/) commands')
      process.exit(1)
    }
  })

async function main() {
  await migrate()
  program.parse(process.argv)
}

main().catch((error) => {
  log.error(error, 'Error starting bot')
  Sentry.captureException(error)
  process.exit(1)
})
