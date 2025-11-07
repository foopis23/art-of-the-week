import type { ChatInputCommandInteraction } from 'discord.js'
import { MessageFlags, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../lib/command'
import { ConfigureService } from './service'

export const settingsCommand = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Configure the bot settings')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('channel')
        .setDescription('Configure the theme announcement channel')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('The channel to send the theme announcement to')
            .setRequired(true),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild?.id) {
      await interaction.reply({
        content: 'This command can only be used in a guild',
        options: { ephemeral: true },
      })
      return
    }

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    })

    switch (interaction.options.getSubcommand()) {
      case 'channel': {
        const channel = interaction.options.getChannel('channel')

        if (!channel) {
          await interaction.editReply({
            content: 'No channel provided',
            options: { ephemeral: true },
          })
          return
        }

        const result = await ConfigureService.setThemeAnnouncementChannel(
          interaction.guild.id,
          channel.id,
        )
        if (result instanceof Error) {
          await interaction.editReply({
            content: `Error setting theme announcement channel: ${result.message}`,
          })
        } else {
          await interaction.editReply({
            content: `Theme announcement channel set to ${channel.name}`,
          })
        }
        break
      }

      default:
        await interaction.editReply({ content: 'Invalid subcommand' })
        return
    }
  },
  deploy: 'guild' as const,
} satisfies Command

export const settingsCommands: Command[] = [settingsCommand]
