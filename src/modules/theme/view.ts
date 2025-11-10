import type { Interactable } from '@/lib/discord/Interactable'
import type { MessageTemplate } from '@/lib/discord/message'
import { stripIndents } from 'common-tags'
import type { MessageComponentInteraction } from 'discord.js'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  TextDisplayBuilder,
} from 'discord.js'

export const themeSubmissionButtonInteractable = {
  data: new ButtonBuilder()
    .setCustomId('open_theme_submission')
    .setLabel('Upload Submission')
    .setStyle(ButtonStyle.Primary),
  execute: async (interaction: MessageComponentInteraction) => {
    await interaction.reply('Upload Submission')
  },
} satisfies Interactable

export const themeAnnouncementTemplate: MessageTemplate<{
  theme: string
}> = (props) => {
  const { theme } = props
  const date = new Date()
  const deadline = new Date(date.getTime() + 1000 * 60 * 60 * 24 * 7)
  const dateString = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const deadlineString = deadline.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      new TextDisplayBuilder()
        .setContent(
          stripIndents`
          # Theme of the Week (${dateString})
          ~~                                                                                                                ~~
          -# The dawn of the new week has begun.
          ## New Theme: [${theme}]
          Deadline: ${deadlineString}, 11:59pm
          All art is accepted. Submission Link:
        `,
        )
        .toJSON(),
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(themeSubmissionButtonInteractable.data)
        .toJSON(),
      new TextDisplayBuilder()
        .setContent(
          `https://drive.google.com/drive/folders/1c2KhgvSKbzuEB9rNHzcNK6L3GHOydXtL`, // TODO: move to guild settings
        )
        .toJSON(),
    ],
  }
}

export const themeInteractables: Interactable[] = [themeSubmissionButtonInteractable]
