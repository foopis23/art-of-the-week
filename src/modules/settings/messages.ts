import type { StreaksMode } from '@/db/schema'
import type { Interactable } from '@/lib/discord/Interactable'
import { stripIndent } from 'common-tags'
import type { ModalSubmitInteraction } from 'discord.js'
import {
  ChannelSelectMenuBuilder,
  ChannelType,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import type { SettingsModel } from './model'
import { SettingsService } from './service'

export const generalSettingsModalInteractable = {
  customId: 'general_settings',
  component: (props: SettingsModel.GeneralSettings) => {
    const { streaksMode, themeAnnouncementChannelId } = props

    const streakDisabledOption = new StringSelectMenuOptionBuilder()
      .setLabel('Disabled')
      .setValue('disabled')
    const streakStreaksOption = new StringSelectMenuOptionBuilder()
      .setLabel('Streaks')
      .setValue('streaks')
    const streakAccumulativeOption = new StringSelectMenuOptionBuilder()
      .setLabel('Accumulative')
      .setValue('accumulative')
    switch (streaksMode) {
      case 'disabled':
        streakDisabledOption.setDefault(true)
        break
      case 'streaks':
        streakStreaksOption.setDefault(true)
        break
      case 'accumulative':
        streakAccumulativeOption.setDefault(true)
        break
      default:
        break
    }

    const channelSelector = new ChannelSelectMenuBuilder()
      .setCustomId('theme_announcement_channel')
      .setChannelTypes([ChannelType.GuildText])
      .setPlaceholder('Select a channel')
      .setMaxValues(1)
      .setRequired(false)

    if (themeAnnouncementChannelId) {
      channelSelector.setDefaultChannels(themeAnnouncementChannelId)
    }

    return new ModalBuilder()
      .setCustomId('general_settings')
      .setTitle('Art Jam - General Settings')
      .addLabelComponents(
        new LabelBuilder()
          .setLabel('Theme Announcement Channel')
          .setChannelSelectMenuComponent(channelSelector),
        new LabelBuilder()
          .setLabel('Streaks Mode')
          .setStringSelectMenuComponent(
            new StringSelectMenuBuilder()
              .addOptions(streakDisabledOption, streakStreaksOption, streakAccumulativeOption)
              .setMaxValues(1)
              .setMinValues(1)
              .setPlaceholder('Select an option')
              .setCustomId('streaks_mode'),
          ),
      )
  },
  execute: async (interaction: ModalSubmitInteraction) => {
    const guildId = interaction.guildId
    if (!guildId) {
      await interaction.editReply({
        content: 'No guild ID found',
      })
      return
    }

    const rawStreaksMode = interaction.fields.getStringSelectValues('streaks_mode')[0]
    let streaksMode: StreaksMode | undefined = undefined
    switch (rawStreaksMode) {
      case 'disabled':
        streaksMode = 'disabled'
        break
      case 'streaks':
        streaksMode = 'streaks'
        break
      case 'accumulative':
        streaksMode = 'accumulative'
        break
      default:
        if (rawStreaksMode !== undefined) {
          throw new Error(`Invalid streaks mode: ${rawStreaksMode}`)
        }
        break
    }
    const rawThemeChannel = interaction.fields.getSelectedChannels('theme_announcement_channel')
    const themeAnnouncementChannelId = rawThemeChannel?.values().toArray()[0]?.id ?? null

    await SettingsService.setGeneralSettings({
      guildId: guildId,
      // themeAnnouncementDay,
      streaksMode: streaksMode,
      themeAnnouncementChannelId,
    })

    await interaction.reply({})
  },
} satisfies Interactable

export const googleDriveConfigurationModalInteractable = {
  customId: 'google_drive_settings',
  component: ({ googleDriveFolderURL, googleDriveEnabled }: SettingsModel.GoogleDriveSettings) => {
    const enabledOption = new StringSelectMenuOptionBuilder().setLabel('Enabled').setValue('true')
    const disabledOption = new StringSelectMenuOptionBuilder()
      .setLabel('Disabled')
      .setValue('false')
    if (googleDriveEnabled) {
      enabledOption.setDefault(true)
    } else {
      disabledOption.setDefault(true)
    }

    return new ModalBuilder()
      .setCustomId('google_drive_settings')
      .setTitle('Art Jam - Google Drive Settings')
      .addLabelComponents(
        new LabelBuilder()
          .setLabel('Enabled')
          .setStringSelectMenuComponent(
            new StringSelectMenuBuilder()
              .addOptions(enabledOption, disabledOption)
              .setMaxValues(1)
              .setMinValues(1)
              .setPlaceholder('Select an option')
              .setRequired(true)
              .setCustomId('google_drive_enabled'),
          ),
        new LabelBuilder().setLabel('Google Drive Folder URL').setTextInputComponent(
          new TextInputBuilder()
            .setCustomId('folder_url')
            .setValue(googleDriveFolderURL ?? '')
            .setPlaceholder('https://drive.google.com/drive/folders/1234567890')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false),
        ),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(
            stripIndent`
            **Instructions**
            1. Create a new folder in your Google Drive.
            2. Share that folder with \`weeklyarttheme@gmail.com\` and give it Editor access.
            3. Paste the folder's URL in the field below.
          `,
          )
          .toJSON(),
      )
      .addLabelComponents()
  },
  execute: async (interaction: ModalSubmitInteraction) => {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    })

    if (!interaction.guildId) {
      await interaction.editReply({
        content: 'No guild ID found',
      })
      return
    }

    let folderURL: string | null = interaction.fields.getTextInputValue('folder_url')
    if (folderURL.length === 0) {
      folderURL = null
    }
    const enabled = interaction.fields.getStringSelectValues('google_drive_enabled')[0] === 'true'
    await SettingsService.setGoogleDriveSettings({
      guildId: interaction.guildId,
      googleDriveFolderURL: folderURL,
      googleDriveEnabled: enabled,
    })
    await interaction.editReply({
      content: 'Google Drive Settings updated',
    })
  },
} satisfies Interactable

export const settingsInteractables: Interactable[] = [
  googleDriveConfigurationModalInteractable,
  generalSettingsModalInteractable,
]
