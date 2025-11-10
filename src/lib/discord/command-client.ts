import { Client, Collection, type ClientOptions } from 'discord.js'
import type { Command } from './command'
import type { Interactable } from './Interactable'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasCustomId<T extends Record<string, any>>(data: T): data is T & { custom_id: string } {
  return 'custom_id' in data
}

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
        const json = interactable.data.toJSON()
        if (!hasCustomId(json)) {
          throw new Error('Interactable must have a customId')
        }
        return [json.custom_id, interactable]
      }),
    )
  }
}
