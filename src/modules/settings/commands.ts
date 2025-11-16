import type { Command } from '@/lib/discord/command'
import type { ChatInputCommandInteraction } from 'discord.js'
import { MessageFlags, SlashCommandBuilder } from 'discord.js'
import { SettingsService } from './service'

export const settingsCommand = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Configure the bot settings')
    .addSubcommand((subcommand) =>
      subcommand.setName('general').setDescription('Configure the general settings'),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('google-drive').setDescription('Configure the Google Drive settings'),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild?.id) {
      await interaction.reply({
        content: 'This command can only be used in a guild',
        options: { ephemeral: true },
      })
      return
    }

    switch (interaction.options.getSubcommand()) {
      case 'general': {
        if (!interaction.guild.id) {
          await interaction.reply({
            content: 'No guild ID found',
            flags: MessageFlags.Ephemeral,
          })
          return
        }

        await interaction.showModal(
          await SettingsService.createGeneralSettingsModal({
            guildId: interaction.guild.id,
          }),
        )
        break
      }
      case 'google-drive': {
        if (!interaction.guild.id) {
          await interaction.reply({
            content: 'No guild ID found',
            flags: MessageFlags.Ephemeral,
          })
          return
        }

        await interaction.showModal(
          await SettingsService.createGoogleDriveConfigurationModal({
            guildId: interaction.guild.id,
          }),
        )
        break
      }

      default:
        await interaction.reply({ content: 'Invalid subcommand', flags: MessageFlags.Ephemeral })
        return
    }
  },
  deploy: 'global' as const,
} satisfies Command

export const settingsCommands: Command[] = [settingsCommand]
