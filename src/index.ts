import { client } from '@/client'
import { commands } from '@/commands'
import { env } from '@/env'
import { jobs } from '@/jobs'
import { log } from '@/log'
import * as Sentry from '@sentry/node'
import { program } from 'commander'
import { Cron } from 'croner'
import type { ChatInputCommandInteraction } from 'discord.js'
import { MessageFlags, REST, Routes } from 'discord.js'
import pkg from '../package.json'
import { migrate } from './db'
import { AnalyticsService } from './modules/analytics/service'

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    integrations: [Sentry.pinoIntegration()],
    enabled: env.NODE_ENV === 'production',
  })
}

program
  .name('art-of-the-week')
  .description('A discord bot for the Art of the Week project')
  .version(pkg.version, '-v, --version', 'Display the version')
  .action(async () => {
    client.once('clientReady', (client) => {
      log.info(
        {
          userId: client.user?.id,
          tag: client.user?.tag,
        },
        'Successfully logged in',
      )
    })

    client.on('interactionCreate', async (interaction) => {
      log.debug(interaction, 'interaction created')

      AnalyticsService.captureEventFromInteraction({
        event: 'interaction_created',
        interaction,
      })

      try {
        if (interaction.isCommand()) {
          const commandName = interaction.commandName
          const command = client.commands.get(commandName)

          if (!command) {
            log.error(interaction, 'Command not found')

            AnalyticsService.captureEventFromInteraction({
              event: 'command_not_found',
              interaction,
            })

            return interaction.reply({
              content: 'Command not found',
              flags: MessageFlags.Ephemeral,
            })
          }

          log.info(command, 'Executing command')

          await command.execute(interaction as ChatInputCommandInteraction, { client })

          AnalyticsService.captureEventFromInteraction({
            event: 'command_executed',
            interaction,
          })
        } else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
          if (!client.interactables.has(interaction.customId)) {
            log.error(
              { interaction, interactables: client.interactables.entries() },
              'Interactable not found',
            )

            AnalyticsService.captureEventFromInteraction({
              event: 'interactable_not_found',
              interaction,
            })

            return interaction.reply({
              content: 'Interactable not found',
              flags: MessageFlags.Ephemeral,
            })
          }
          const interactable = client.interactables.get(interaction.customId)!
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- i could fix this, but it doesn't seem worth it.
          await interactable.execute(interaction as any)
        } else {
          log.error(interaction, 'Unknown interaction type')

          AnalyticsService.captureEventFromInteraction({
            event: 'unhandled_interaction',
            interaction,
          })

          return
        }
      } catch (error) {
        log.error(error, 'Uncaught error executing interaction')
        Sentry.captureException(error)
        const errorMessage =
          'An error occurred while executing the interaction\n```\n' + String(error) + '\n```'
        if (interaction.isRepliable()) {
          if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
              content: errorMessage,
            })
          } else {
            await interaction.reply({
              content: errorMessage,
              flags: MessageFlags.Ephemeral,
            })
          }
        }

        AnalyticsService.captureEventFromInteraction({
          event: 'unhandled_interaction_error',
          interaction,
          properties: {
            error: String(error),
          },
        })
      }
    })

    client.login(env.DISCORD_TOKEN)
    const crons = jobs.map(
      (job) =>
        new Cron(job.schedule, job.options ?? {}, async (self, context) => {
          log.info({ job: job.options?.name }, 'Executing cron job')
          await job.execute(self, context)
          log.info({ job: job.options?.name }, 'Cron job executed')
        }),
    )
    log.info(
      {
        crons: crons.map((cron) => ({
          name: cron.name,
          schedule: cron.getPattern(),
          next: cron.nextRun()?.toLocaleString(),
        })),
      },
      'Started cron jobs',
    )
  })

program
  .command('deploy')
  .description('Deploy commands')
  .action(async () => {
    try {
      const rest = new REST().setToken(env.DISCORD_TOKEN)
      if (env.DISCORD_TESTING_GUILD_ID) {
        log.info(
          {
            commands: commands.map((command) => command.data.name),
            count: commands.length,
          },
          'Started refreshing application guild (/) commands',
        )

        const commandsResponse = await rest.put(
          Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_TESTING_GUILD_ID),
          {
            body: commands
              .filter((command) => command.deploy === 'guild' || command.deploy === 'global')
              .map((command) => command.data.toJSON()),
          },
        )
        log.info(commandsResponse, 'Successfully refreshed application guild (/) commands')
      }

      log.info(
        {
          commands: commands.map((command) => command.data.name),
          count: commands.length,
        },
        'Started refreshing application global (/) commands',
      )

      const commandsResponse = await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), {
        body: commands
          .filter((command) => command.deploy === 'global')
          .map((command) => command.data.toJSON()),
      })
      log.info(commandsResponse, 'Successfully refreshed application global (/) commands')
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
