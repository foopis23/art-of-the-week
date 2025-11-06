import nacl from 'tweetnacl'
import { env } from '../../env'
import { log } from '../../log'
import { DiscordModel } from './model'

export abstract class DiscordService {
  static validateInteractionSignature(signature: string, timestamp: string, content: string) {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + content),
      Buffer.from(signature, 'hex'),
      Buffer.from(env.DISCORD_PUBLIC_KEY, 'hex'),
    )
  }

  static async handleInteraction(interaction: DiscordModel.InteractionBody) {
    switch (interaction.type) {
      case DiscordModel.InteractionType.PING:
        return this.handlePingInteraction(interaction)
      case DiscordModel.InteractionType.APPLICATION_COMMAND:
        return this.handleApplicationCommandInteraction(interaction)
      default:
        throw new Error('Invalid interaction type')
    }
  }

  private static async handlePingInteraction(interaction: DiscordModel.PingInteraction) {
    log.info({ interaction }, 'Ping interaction received')
    return {
      type: DiscordModel.InteractionCallbackType.PONG,
    }
  }

  private static async handleApplicationCommandInteraction(
    interaction: DiscordModel.ApplicationCommandInteraction,
  ) {
    throw new Error('Application command interactions are not supported yet')
  }
}
