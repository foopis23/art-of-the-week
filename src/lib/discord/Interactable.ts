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

export type Interactable =
  | {
      data: ButtonBuilder
      execute: (interaction: ButtonInteraction) => Promise<void>
    }
  | {
      data: StringSelectMenuBuilder
      execute: (interaction: StringSelectMenuInteraction) => Promise<void>
    }
  | {
      data: TextInputBuilder
      execute: (interaction: UserSelectMenuInteraction) => Promise<void>
    }
  | {
      data: RoleSelectMenuBuilder
      execute: (interaction: RoleSelectMenuInteraction) => Promise<void>
    }
  | {
      data: MentionableSelectMenuBuilder
      execute: (interaction: MentionableSelectMenuInteraction) => Promise<void>
    }
  | {
      data: ChannelSelectMenuBuilder
      execute: (interaction: ChannelSelectMenuInteraction) => Promise<void>
    }
  | {
      data: ModalBuilder
      execute: (interaction: ModalSubmitInteraction) => Promise<void>
    }
