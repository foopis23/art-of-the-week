import { client } from '@/client'
import { getCurrentDayOfTheWeek } from '@/lib/date'
import { log } from '@/log'
import { SettingsService } from '@/modules/settings/service'
import { DEFAULT_THEME_POOL, JAM_SUBMISSION_SCORE } from '@/modules/theme/const'
import {
  type Attachment,
  type GuildMember,
  type Message,
  type MessageCreateOptions,
  type MessagePayload,
} from 'discord.js'
import { GoogleDriveService } from '../google-drive/service'
import type { SettingsModel } from '../settings/model'
import { themeAnnouncementTemplate, themeSubmissionMessageTemplate } from './messages'
import { JamModel, JamSubmissionModel, ThemePoolModel } from './model'

export abstract class ThemeService {
  /**
   * Generate a theme for all guilds that have a theme announcement channel and the current day of the week is the same as the theme announcement day.
   */
  static async generateThemeForAllGuilds(): Promise<void> {
    const currentDayOfTheWeek = getCurrentDayOfTheWeek()
    const allGuildSettings = await SettingsService.getAllByThemeAnnouncementDay(currentDayOfTheWeek)

    for (const guildSettings of allGuildSettings) {
      await this.generateThemeForGuild(guildSettings)
    }
  }

  /**
   * Force generate a theme for a guild.
   */
  static async forceGenerateThemeForGuild(guildId: string): Promise<void | Error> {
    const guildSettings = await SettingsService.getGuildSettings(guildId)
    await this.generateThemeForGuild(guildSettings)
  }

  /**
   * Handle a theme submission.
   */
  static async handleThemeSubmission(
    fields: {
      submissions: Attachment[]
      description: string
    },
    message: Message,
    user: GuildMember,
  ) {
    const { submissions, description } = fields
    const jamResults = await JamModel.getByMessageId({ messageId: message.id })

    if (jamResults.length === 0 || !jamResults[0]) {
      throw new Error('Failed to get find jam by message id')
    }
    const jam = jamResults[0]
    const jamId = jam.id

    const guildSettings = await SettingsService.getGuildSettings(message.guildId!)

    const submission = await JamSubmissionModel.create(
      {
        guildId: message.guildId!,
        userId: user.id,
        username: user.nickname ?? user.user.username,
        themeId: jamId,
        description,
      },
      submissions.map((submission) => ({
        url: submission.url,
        contentType: submission.contentType ?? '',
        name: submission.name,
      })),
    )

    if (guildSettings.googleDriveEnabled) {
      if (!jamResults[0].themeSubmissionFolderId) {
        const themeSubmissionFolderId = await this.createThemeSubmissionFolderForJam(
          guildSettings,
          jamResults[0],
        )
        jamResults[0].themeSubmissionFolderId = themeSubmissionFolderId
        if (!jamResults[0].themeSubmissionFolderId) {
          throw new Error('Failed to update jam with theme submission folder id')
        }
      }

      const themeSubmissionFolderId = jamResults[0].themeSubmissionFolderId

      await Promise.all(
        submission.attachments.map(async (attachment) => {
          const id = await GoogleDriveService.uploadAttachmentToGoogleDriveFolder(
            attachment,
            user.nickname ?? user.user.username,
            themeSubmissionFolderId,
          )
          await JamSubmissionModel.updateAttachmentsGoogleDriveFileId({
            submissionAttachmentId: attachment.id,
            googleDriveFileId: id,
          })
        }),
      )
    }

    await this.sendThemeChannelMessage(
      message.guildId!,
      message.channelId!,
      themeSubmissionMessageTemplate({ theme: jamId, submissions, description }),
    )
  }

  static async getUserStreakInGuild(guildId: string, userId: string): Promise<number> {
    const jams = await JamModel.getAllJamsWithUserSubmissionForGuild({
      guildId: guildId,
      userId: userId,
    })

    let streak = 0
    for (const jam of jams) {
      const submissions = jam.submissions
      if (submissions.length === 0) {
        continue
      }
      streak++
    }

    return streak
  }

  static async getUserAccumulativeScoreInGuild(guildId: string, userId: string): Promise<number> {
    const jams = await JamModel.getAllJamsWithUserSubmissionForGuild({
      guildId: guildId,
      userId: userId,
    })

    const jamSubmissionCount = jams.filter((jam) => jam.submissions.length > 0).length
    return jamSubmissionCount * JAM_SUBMISSION_SCORE
  }

  private static async generateThemeForGuild(guildSettings: SettingsModel.Model): Promise<string> {
    if (!guildSettings.themeAnnouncementChannelId) {
      throw new Error('Theme announcement channel not found')
    }

    const theme = await this.generateRandomTheme(guildSettings.guildId)

    const message = await this.sendThemeChannelMessage(
      guildSettings.guildId,
      guildSettings.themeAnnouncementChannelId!,
      themeAnnouncementTemplate({ theme }),
    )

    const jam = await JamModel.create({
      guildId: guildSettings.guildId,
      theme,
      messageId: message.id,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).getTime(),
    })

    if (guildSettings.googleDriveEnabled) {
      await this.createThemeSubmissionFolderForJam(guildSettings, jam)
    }

    return theme
  }

  private static async createThemeSubmissionFolderForJam(
    guildSettings: SettingsModel.Model,
    jam: JamModel.Jam,
  ): Promise<string> {
    if (!guildSettings.googleDriveFolderURL) {
      await this.sendThemeChannelMessage(
        guildSettings.guildId!,
        guildSettings.themeAnnouncementChannelId!,
        'ERROR: Google Drive enabled but no folder URL configured',
      )
    }

    if (!guildSettings.googleDriveFolderURL) {
      throw new Error('Google Drive folder URL not found')
    }

    const folderId = await GoogleDriveService.createThemeSubmissionFolder(
      jam.theme,
      new Date(jam.createdAt),
      GoogleDriveService.parseFolderIdFromUrl(guildSettings.googleDriveFolderURL!),
    )

    if (!folderId) {
      throw new Error('Failed to create theme submission folder')
    }

    await JamModel.updateThemeSubmissionFolderId({
      jamId: jam.id,
      themeSubmissionFolderId: folderId,
    })

    return folderId
  }

  /**
   * Generate a random theme from a guild's theme pool.
   */
  private static async generateRandomTheme(guildId: string): Promise<string> {
    const totalThemeCount = await ThemePoolModel.getGuildThemeCount({
      guildId,
    })

    if (totalThemeCount.length === 0 || !totalThemeCount[0]) {
      throw new Error('Failed to get theme count')
    }

    if (totalThemeCount[0]?.count === 0) {
      await this.setDefaultThemesForGuild(guildId)
    }

    const availableThemeCount = await ThemePoolModel.getGuildUnusedThemeCount({
      guildId,
    })

    if (availableThemeCount.length === 0 || !availableThemeCount[0]) {
      throw new Error('Failed to get available theme count')
    }

    if (availableThemeCount[0]?.count === 0) {
      await ThemePoolModel.resetThemeUsageForGuild({ guildId })
    }

    const randomTheme = await ThemePoolModel.getRandomForGuild({ guildId })

    if (randomTheme.length === 0 || !randomTheme[0]) {
      throw new Error('Failed to get random theme')
    }

    await ThemePoolModel.setThemeAsUsed({ guildId, theme: randomTheme[0].theme })

    return randomTheme[0].theme
  }

  /**
   * Set the default available themes for a guild.
   */
  private static async setDefaultThemesForGuild(guildId: string): Promise<void> {
    await ThemePoolModel.deleteGuildThemes({ guildId })
    await ThemePoolModel.insertGuildThemes({ guildId, themes: DEFAULT_THEME_POOL })
  }

  /**
   * Send a message to the theme announcement channel.
   */
  private static async sendThemeChannelMessage(
    guildId: string,
    channelId: string,
    message: string | MessagePayload | MessageCreateOptions,
  ) {
    const guild = await client.guilds.fetch(guildId)
    const channel = await guild.channels.fetch(channelId)
    if (!channel || !channel.isTextBased()) {
      log.error({ channelId }, 'Failed to send message. Channel is not text based.')
      throw new Error('Failed to send message. Channel is not text based.')
    }

    if (channel.isSendable()) {
      const result = await channel.send(message)
      return result
    } else {
      log.error({ channelId }, 'Failed to send message. Channel is not sendable.')
      throw new Error('Failed to send message. Channel is not sendable.')
    }
  }
}
