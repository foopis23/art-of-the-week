import { GatewayIntentBits } from 'discord.js'
import { commands } from './commands'
import { CommandClient } from './lib/command-client'

export const client = new CommandClient({ intents: [GatewayIntentBits.Guilds] }, commands)
