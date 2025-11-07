import type { ChatInputCommandInteraction } from 'discord.js'
import { MessageFlags, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../lib/command'
import { ThemeService } from './service'

export const generateThemeCommand = {
  data: new SlashCommandBuilder().setName('theme').setDescription('Force regenerate a theme'),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild?.id) {
      await interaction.reply({
        content: 'This command can only be used in a guild',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    })

    const result = await ThemeService.forceGenerateThemeForGuild(interaction.guild.id)
    if (result instanceof Error) {
      await interaction.editReply({
        content: `Error generating theme: ${result.message}`,
      })
      return
    }

    await interaction.editReply({
      content: 'Successfully forced theme regeneration',
    })
  },
  deploy: 'guild',
} satisfies Command

export const themeCommands: Command[] = [generateThemeCommand]
