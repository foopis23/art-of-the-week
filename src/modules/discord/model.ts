import z from 'zod'

export namespace DiscordModel {
  export enum InteractionType {
    PING = 1,
    APPLICATION_COMMAND = 2,
    MESSAGE_COMPONENT = 3,
    APPLICATION_COMMAND_AUTOCOMPLETE = 4,
    MODAL_SUBMIT = 5,
  }

  export enum InteractionCallbackType {
    PONG = 1,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
    DEFERRED_UPDATE_MESSAGE = 6,
    UPDATE_MESSAGE = 7,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
    MODAL = 9,
    PREMIUM_REQUIRED = 10,
    LAUNCH_ACTIVITY = 12,
  }

  export const baseInteraction = z.object({
    id: z.string(),
    type: z.enum(InteractionType),
  })
  export type BaseInteraction = z.infer<typeof baseInteraction>

  export const pingInteraction = baseInteraction.extend({
    type: z.literal(InteractionType.PING),
  })
  export type PingInteraction = z.infer<typeof pingInteraction>

  export const applicationCommandInteraction = baseInteraction.extend({
    type: z.literal(InteractionType.APPLICATION_COMMAND),
    data: z.object({
      name: z.string(),
    }),
  })
  export type ApplicationCommandInteraction = z.infer<typeof applicationCommandInteraction>

  export const interactionBody = z.union([pingInteraction, applicationCommandInteraction])
  export type InteractionBody = z.infer<typeof interactionBody>
}
