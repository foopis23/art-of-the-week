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
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import type { GuildJamModel, JamSubmissionModel } from './model'
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
        new LabelBuilder()
          .setLabel('Share Globally')
          .setDescription('Share your submission globally with all users of the bot')
          .setStringSelectMenuComponent(
            new StringSelectMenuBuilder()
              .addOptions([
                new StringSelectMenuOptionBuilder().setLabel('true').setValue('true'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('false')
                  .setValue('false')
                  .setDefault(true),
              ])
              .setMaxValues(1)
              .setMinValues(1)
              .setPlaceholder('Select an option')
              .setCustomId('share_globally'),
          ),
        new LabelBuilder()
          .setLabel('Share with Guilds')
          .setDescription(
            'Share your submission with other guilds you are in (if they have the bot installed)',
          )
          .setStringSelectMenuComponent(
            new StringSelectMenuBuilder()
              .addOptions([
                new StringSelectMenuOptionBuilder()
                  .setLabel('true')
                  .setValue('true')
                  .setDefault(true),
                new StringSelectMenuOptionBuilder().setLabel('false').setValue('false'),
              ])
              .setMaxValues(1)
              .setMinValues(1)
              .setPlaceholder('Select an option')
              .setCustomId('share_guilds'),
          ),
      ),
  execute: async (interaction: ModalSubmitInteraction) => {
    if (!interaction.message) {
      throw new Error('Message not found')
    }
    if (!interaction.member) {
      throw new Error('Member not found')
    }

    // Defer reply first to prevent interaction timeout (Discord requires response within 3 seconds)
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    })

    await JamService.handleThemeSubmission(
      {
        submissions: interaction.fields.getUploadedFiles('submissions')?.values().toArray() ?? [],
        description: interaction.fields.getTextInputValue('description'),
        title: interaction.fields.getTextInputValue('title') ?? undefined,
        shareGlobally: interaction.fields.getStringSelectValues('share_globally')[0] === 'true',
        shareGuilds: interaction.fields.getStringSelectValues('share_guilds')[0] === 'true',
      },
      interaction.message,
      interaction.member as GuildMember, // this should always be a GuildMember as far as I can tell
    )

    await interaction.editReply({
      content: 'Submitted successfully',
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
  guildJam: GuildJamModel.GuildJam
  submission: JamSubmissionModel.JamSubmissionWithAttachments
}> = (props) => {
  const { guildJam, submission } = props

  const mediaGallery = new MediaGalleryBuilder()
  for (const attachment of submission.attachments) {
    mediaGallery.addItems(new MediaGalleryItemBuilder().setURL(attachment.url))
  }

  const title = submission.title ? `#  — ${submission.title} — \n` : ''
  const dateString = new Date(guildJam.createdAt).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })
  const description = submission.description ? `${submission.description}\n\n` : ''
  const footer = `-# Submission for [[${dateString} - ${guildJam.jam.theme}](${guildJam.messageLink})]\n\n`

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

export const jamMidweekReminderTemplate: MessageTemplate<{
  guildJam: GuildJamModel.GuildJam
}> = (props) => {
  const { guildJam } = props

  const deadline = new Date(guildJam.jam.deadline)
  const deadlineString = deadline.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      new TextDisplayBuilder().setContent(stripIndents`
        # —Reminder—
        For Art Jam [[${guildJam.jam.theme}](${guildJam.messageLink})]

        Submission deadline is ${deadlineString}, 11:59pm.
      `),
    ],
  }
}

export const jamRecapMessageTemplate: MessageTemplate<{
  guildJam: GuildJamModel.GuildJam
  submissions: JamSubmissionModel.JamSubmissionWithAttachments[]
}> = (props) => {
  const { guildJam, submissions } = props

  const submissionsSortedByCreatedAt = submissions.sort((a, b) => a.createdAt - b.createdAt)

  const latestSubmission = submissionsSortedByCreatedAt[0]
  const earliestSubmission = submissionsSortedByCreatedAt[submissionsSortedByCreatedAt.length - 1]
  const totalSubmissions = submissionsSortedByCreatedAt.length

  if (!latestSubmission || !earliestSubmission) {
    throw new Error('No submissions found')
  }

  const latestSubmissionDate = new Date(latestSubmission.createdAt).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })
  const latestSubmissionTime = new Date(latestSubmission.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const earliestSubmissionDate = new Date(earliestSubmission.createdAt).toLocaleDateString(
    'en-US',
    {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    },
  )
  const earliestSubmissionTime = new Date(earliestSubmission.createdAt).toLocaleTimeString(
    'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  )

  const jamDateString = new Date(guildJam.createdAt).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      new TextDisplayBuilder().setContent(stripIndents`
        # —End of the Week—
        -# Submission for Art Jam [[${jamDateString} - ${guildJam.jam.theme}](${guildJam.messageLink})] is over

        Contributions: [${totalSubmissions}]
        First Submission: ${earliestSubmissionDate} ${earliestSubmissionTime}
        Last Submission: ${latestSubmissionDate} ${latestSubmissionTime}
      `),
    ],
  }
}

export const jamInteractables: Interactable[] = [
  jamSubmissionModalInteractable,
  jamSubmissionButtonInteractable,
]
