import { CommandClient } from '@/lib/discord/command-client'
import { commands } from '@/modules/bot/commands'
import { interactables } from '@/modules/bot/interactables'
import { GatewayIntentBits } from 'discord.js'

export const client = new CommandClient(
  { intents: [GatewayIntentBits.Guilds] },
  commands,
  interactables,
)
