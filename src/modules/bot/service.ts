import { env } from '@/env'
import { log } from '@/log'
import * as Sentry from '@sentry/node'
import type { ChatInputCommandInteraction } from 'discord.js'
import { MessageFlags, REST, Routes } from 'discord.js'
import { AnalyticsService } from '../analytics/service'
import { client } from './client'
import { commands } from './commands'

export abstract class BotService {
  static async start() {
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
  }

  static async deployCommands() {
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
  }
}
