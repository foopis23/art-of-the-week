import type { Command } from '@/lib/discord/command'
import type { ChatInputCommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

export const pingCommand = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Ping the bot'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Pong!')
  },
  deploy: 'guild',
} satisfies Command

export const pingCommands: Command[] = [pingCommand]
