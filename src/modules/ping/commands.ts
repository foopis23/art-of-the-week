import type { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../lib/command'

export const pingCommand = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Ping the bot'),
  async execute(interaction: CommandInteraction) {
    await interaction.reply('Pong!')
  },
  deploy: 'guild',
} satisfies Command

export const pingCommands: Command[] = [pingCommand]
