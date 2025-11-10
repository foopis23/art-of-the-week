import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js'
import type { CommandClient } from './command-client'

export type Command = {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
  execute: (
    interaction: ChatInputCommandInteraction,
    ctx: { client: CommandClient },
  ) => Promise<void>
  deploy: 'global' | 'guild' | 'none'
}
