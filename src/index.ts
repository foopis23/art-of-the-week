import { program } from 'commander'
import { GatewayIntentBits, REST, Routes } from 'discord.js'
import pkg from '../package.json'
import { env } from './env'
import { CommandClient } from './lib/command-client'
import { log } from './log'
import { pingCommands } from './modules/ping/commands'
import { themeCommands } from './modules/theme/commands'

const commands = [...pingCommands, ...themeCommands]

program
  .name('art-of-the-week')
  .description('A discord bot for the Art of the Week project')
  .version(pkg.version, '-v, --version', 'Display the version')
  .action(async () => {
    const client = new CommandClient({ intents: [GatewayIntentBits.Guilds] }, commands)

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
      if (!interaction.isCommand()) return
      log.info(interaction, 'Command interaction created')
      const commandName = interaction.commandName
      const command = client.commands.get(commandName)

      if (!command) {
        log.error(interaction, 'Command not found')
        return interaction.reply({ content: 'Command not found', ephemeral: true })
      }

      log.info(command, 'Executing command')
      await command.execute(interaction)
    })

    client.login(env.DISCORD_TOKEN)
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

program.parse(process.argv)
