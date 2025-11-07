import { Client, type ClientOptions, type Collection } from 'discord.js'
import type { Command } from '../commands/type'

export class CommandClient extends Client {
  constructor(
    options: ClientOptions,
    public readonly commands: Collection<string, Command>,
  ) {
    super(options)
    this.commands = commands
  }
}
