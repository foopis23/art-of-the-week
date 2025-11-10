import type { MessageCreateOptions, MessagePayload } from 'discord.js'

export type MessageTemplate<T = unknown> = (
  data: T,
) => string | MessageCreateOptions | MessagePayload
