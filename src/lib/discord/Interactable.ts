import type {
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
} from 'discord.js'

import type {
  ButtonBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  UserSelectMenuBuilder,
} from 'discord.js'

export type AnySelectMenuBuilder =
  | StringSelectMenuBuilder
  | UserSelectMenuBuilder
  | RoleSelectMenuBuilder
  | MentionableSelectMenuBuilder
  | ChannelSelectMenuBuilder

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Interactable<T = any> =
  | {
      customId: string
      component: (props: T) => ButtonBuilder
      execute: (interaction: ButtonInteraction) => Promise<void>
    }
  | {
      customId: string
      component: (props: T) => StringSelectMenuBuilder
      execute: (interaction: StringSelectMenuInteraction) => Promise<void>
    }
  | {
      customId: string
      component: (props: T) => TextInputBuilder
      execute: (interaction: UserSelectMenuInteraction) => Promise<void>
    }
  | {
      customId: string
      component: (props: T) => RoleSelectMenuBuilder
      execute: (interaction: RoleSelectMenuInteraction) => Promise<void>
    }
  | {
      customId: string
      component: (props: T) => MentionableSelectMenuBuilder
      execute: (interaction: MentionableSelectMenuInteraction) => Promise<void>
    }
  | {
      customId: string
      component: (props: T) => ChannelSelectMenuBuilder
      execute: (interaction: ChannelSelectMenuInteraction) => Promise<void>
    }
  | {
      customId: string
      component: (props: T) => ModalBuilder
      execute: (interaction: ModalSubmitInteraction) => Promise<void>
    }
