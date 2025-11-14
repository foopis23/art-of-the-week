import type { Interactable } from '@/lib/discord/Interactable'
import type { MessageTemplate } from '@/lib/discord/message'
import { stripIndents } from 'common-tags'
import type { ButtonInteraction, GuildMember, ModalSubmitInteraction } from 'discord.js'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  FileUploadBuilder,
  LabelBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
  ModalBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import type { JamModel, JamSubmissionModel } from './model'
import { JamService } from './service'

export const jamSubmissionModalInteractable = {
  customId: 'theme_submission',
  component: () =>
    new ModalBuilder()
      .setCustomId('theme_submission')
      .setTitle('Upload Submission')
      .addLabelComponents(
        new LabelBuilder()
          .setLabel('Submission')
          .setFileUploadComponent(
            new FileUploadBuilder().setCustomId('submissions').setMaxValues(10),
          ),
        new LabelBuilder()
          .setLabel('Title')
          .setDescription('Optional title of the submission')
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId('title')
              .setStyle(TextInputStyle.Short)
              .setRequired(false),
          ),
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

    await JamService.handleThemeSubmission(
      {
        submissions: interaction.fields.getUploadedFiles('submissions')?.values().toArray() ?? [],
        description: interaction.fields.getTextInputValue('description'),
        title: interaction.fields.getTextInputValue('title') ?? undefined,
      },
      interaction.message,
      interaction.member as GuildMember, // this should always be a GuildMember as far as I can tell
    )

    await interaction.editReply({
      content: 'Submission received',
    })
  },
} satisfies Interactable

export const jamSubmissionButtonInteractable = {
  customId: 'open_theme_submission',
  component: () =>
    new ButtonBuilder()
      .setCustomId('open_theme_submission')
      .setLabel('Upload Submission')
      .setStyle(ButtonStyle.Primary),
  execute: async (interaction: ButtonInteraction) => {
    await interaction.showModal(jamSubmissionModalInteractable.component())
  },
} satisfies Interactable

export const jamAnnouncementTemplate: MessageTemplate<{
  theme: string
  deadline: Date
}> = (props) => {
  const { theme, deadline } = props
  const date = new Date()
  const dateString = date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })
  const deadlineString = deadline.toLocaleDateString('en-US', {
    month: 'numeric',
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
        .addComponents(jamSubmissionButtonInteractable.component())
        .toJSON(),
    ],
  }
}

export const jamSubmissionMessageTemplate: MessageTemplate<{
  jam: JamModel.Jam
  submission: JamSubmissionModel.JamSubmissionWithAttachments
}> = (props) => {
  const { jam, submission } = props

  const mediaGallery = new MediaGalleryBuilder()
  for (const attachment of submission.attachments) {
    mediaGallery.addItems(new MediaGalleryItemBuilder().setURL(attachment.url))
  }

  const title = submission.title ? `#  — ${submission.title} — \n` : ''
  const dateString = new Date(jam.createdAt).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })
  const description = submission.description ? `${submission.description}\n\n` : ''
  const footer = `-# Submission for [[${dateString} - ${jam.theme}](${jam.messageLink})]\n\n`

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      new TextDisplayBuilder().setContent(
        stripIndents`<@${submission.userId}>\n${title}${description}${footer}`,
      ),
      mediaGallery,
    ],
  }
}

export const jamInteractables: Interactable[] = [
  jamSubmissionModalInteractable,
  jamSubmissionButtonInteractable,
]
