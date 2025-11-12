import { Client, Collection, type ClientOptions } from 'discord.js'
import type { Command } from './command'
import type { Interactable } from './Interactable'

export class CommandClient extends Client {
  public readonly commands: Collection<string, Command>
  public readonly interactables: Collection<string, Interactable>

  constructor(options: ClientOptions, commands: Command[], interactables: Interactable[]) {
    super(options)
    this.commands = new Collection<string, Command>(
      commands.map((command) => [command.data.name, command]),
    )

    this.interactables = new Collection<string, Interactable>(
      interactables.map((interactable) => {
        return [interactable.customId, interactable]
      }),
    )
  }
}
