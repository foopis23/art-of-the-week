import type { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../lib/command'
import { ThemeService } from './service'

export const generateThemeCommand = {
  data: new SlashCommandBuilder().setName('theme').setDescription('Generated a random theme'),
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply()

    if (!interaction.guild?.id) {
      await interaction.editReply('This command can only be used in a guild')
      return
    }

    const themeResult = await ThemeService.generateTheme(interaction.guild.id)
    if (themeResult instanceof Error) {
      await interaction.editReply(`Error generating theme: ${themeResult.message}`)
      return
    }
    await interaction.editReply(`The theme is: ${themeResult}`)
  },
  deploy: 'guild',
} satisfies Command

export const themeCommands: Command[] = [generateThemeCommand]
