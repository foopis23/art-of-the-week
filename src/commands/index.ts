import { Collection } from 'discord.js'
import { pingCommand } from './ping'
import type { Command } from './type'

const _commands: Command[] = [pingCommand]

export const commands = new Collection<string, Command>(
  _commands.map((command) => [command.data.name, command]),
)
