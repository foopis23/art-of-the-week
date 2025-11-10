import type { Command } from '@/lib/discord/command'
import { log } from '@/log'
import type { ChatInputCommandInteraction } from 'discord.js'
import { MessageFlags, SlashCommandBuilder } from 'discord.js'
import { SettingsService } from './service'

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
        log.debug({ channel, guildId: interaction.guild.id }, 'Updating theme announcement channel')
        if (!channel) {
          await interaction.editReply({
            content: 'No channel provided',
            options: { ephemeral: true },
          })
          return
        }

        await SettingsService.setThemeAnnouncementChannel(interaction.guild.id, channel.id)
        await interaction.editReply({
          content: `Theme announcement channel set to ${channel.name}`,
        })
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
