import { Client, Collection, type ClientOptions } from 'discord.js'
import type { Command } from './command'

export class CommandClient extends Client {
  public readonly commands: Collection<string, Command>

  constructor(options: ClientOptions, commands: Command[]) {
    super(options)
    this.commands = new Collection<string, Command>(
      commands.map((command) => [command.data.name, command]),
    )
  }
}
