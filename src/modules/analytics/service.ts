import { env } from '@/env'
import { log } from '@/log'
import { posthog } from '@/posthog'
import type { ChatInputCommandInteraction, MessageComponentInteraction } from 'discord.js'
import { InteractionType, type Interaction } from 'discord.js'
import z from 'zod'

export type BaseEventProps = {
  event: string
  properties?: Record<string, unknown>
}

export type EventProps = BaseEventProps & {
  distinctId?: string
  groups?: Record<string, string>
}

export type InteractionBasedEventProps = BaseEventProps & {
  interaction: Interaction
}

export const eventSchema = z.object({
  event: z.string(),
  distinctId: z.string(),
  groups: z.record(z.string(), z.string()).optional(),
  properties: z
    .object({
      messageId: z.string().optional(),
      channelId: z.string().optional(),
      commandName: z.string().optional(),
      customId: z.string().optional(),
      interactionType: z.enum(InteractionType).optional(),
    })
    .loose(),
})

export abstract class AnalyticsService {
  static captureEvent(props: EventProps) {
    if (env.NODE_ENV !== 'production') {
      log.debug(props, 'Skipping event capture in non-production environment')
      return
    }

    const { distinctId, groups, properties } = props
    posthog.capture({
      ...props,
      distinctId: distinctId ?? '',
      groups,
      properties: {
        ...properties,
        $process_person_profile: !!distinctId,
      },
    })
  }

  static captureEventFromInteraction(props: InteractionBasedEventProps) {
    const { interaction } = props
    const distinctId = this.identifyUserFromInteraction(interaction)
    const groupKey = this.identifyGuildFromInteraction(interaction)
    this.captureEvent({
      ...props,
      distinctId,
      groups: groupKey ? { guild: groupKey } : undefined,
      properties: {
        ...props.properties,
        commandName: (interaction as ChatInputCommandInteraction)?.commandName,
        messageId: (interaction as MessageComponentInteraction)?.message?.id,
        channelId: (interaction as MessageComponentInteraction)?.channelId,
        customId: (interaction as MessageComponentInteraction)?.customId,
        interactionType: interaction.type,
      },
    })
  }

  static identifyUserFromInteraction(interaction: Interaction) {
    const userId = interaction.user.id
    posthog.identify({
      distinctId: userId,
      properties: {
        username: interaction.user.username,
        discriminator: interaction.user.discriminator,
      },
    })
    return userId
  }

  static identifyGuildFromInteraction(interaction: Interaction) {
    const guildId = interaction.guildId
    if (!guildId) {
      return undefined
    }
    posthog.groupIdentify({
      groupType: 'guild',
      groupKey: guildId,
      properties: {
        name: interaction.guild?.name,
      },
    })
    return guildId
  }
}
