import { commands } from '@/commands'
import { interactables } from '@/interactables'
import { CommandClient } from '@/lib/discord/command-client'
import { GatewayIntentBits } from 'discord.js'

export const client = new CommandClient(
  { intents: [GatewayIntentBits.Guilds] },
  commands,
  interactables,
)
