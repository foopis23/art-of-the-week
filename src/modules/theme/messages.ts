import type { Interactable } from '@/lib/discord/Interactable'
import type { MessageTemplate } from '@/lib/discord/message'
import { stripIndents } from 'common-tags'
import type { Attachment, ButtonInteraction, GuildMember, ModalSubmitInteraction } from 'discord.js'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  FileBuilder,
  FileUploadBuilder,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import { ThemeService } from './service'

export const themeSubmissionModalInteractable = {
  data: new ModalBuilder()
    .setCustomId('theme_submission')
    .setTitle('Upload Submission')
    .addLabelComponents(
      new LabelBuilder()
        .setLabel('Submission')
        .setFileUploadComponent(new FileUploadBuilder().setCustomId('submissions')),
      new LabelBuilder()
        .setLabel('Description')
        .setDescription('Optional description of the submission')
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId('description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false),
        ),
    ),
  execute: async (interaction: ModalSubmitInteraction) => {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    })

    if (!interaction.message) {
      return
    }
    if (!interaction.member) {
      return
    }

    await ThemeService.handleThemeSubmission(
      {
        submissions: interaction.fields.getUploadedFiles('submissions')?.values().toArray() ?? [],
        description: interaction.fields.getTextInputValue('description'),
      },
      interaction.message,
      interaction.member as GuildMember, // this should always be a GuildMember as far as I can tell
    )

    await interaction.editReply({
      content: 'Submission received',
    })
  },
} satisfies Interactable

export const themeSubmissionButtonInteractable = {
  data: new ButtonBuilder()
    .setCustomId('open_theme_submission')
    .setLabel('Upload Submission')
    .setStyle(ButtonStyle.Primary),
  execute: async (interaction: ButtonInteraction) => {
    await interaction.showModal(themeSubmissionModalInteractable.data)
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

export const themeSubmissionMessageTemplate: MessageTemplate<{
  theme: string
  submissions: Attachment[]
  description: string
}> = (props) => {
  const { theme, submissions, description } = props

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      new TextDisplayBuilder().setContent(
        stripIndents`Submission test for ${theme}\n${description}\n${submissions.map((submission) => submission.url).join('\n')}`,
      ),
      ...submissions.map((submission) => new FileBuilder().setURL(submission.url)),
    ],
  }
}

export const themeInteractables: Interactable[] = [
  themeSubmissionModalInteractable,
  themeSubmissionButtonInteractable,
]
