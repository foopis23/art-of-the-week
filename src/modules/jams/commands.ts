import type { Command } from '@/lib/discord/command'
import { JamService } from '@/modules/jams/service'
import type { ChatInputCommandInteraction } from 'discord.js'
import { MessageFlags, SlashCommandBuilder } from 'discord.js'

export const generateThemeCommand = {
  data: new SlashCommandBuilder()
    .setName('theme')
    .setDescription('Resend the current jam announcement'),
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

    await JamService.resendJamAnnouncement(interaction.guild.id)

    await interaction.editReply({
      content: 'Successfully forced theme regeneration',
    })
  },
  deploy: 'global',
} satisfies Command

export const themeCommands: Command[] = [generateThemeCommand]
