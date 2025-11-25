import { findAllGuildsInCommonWithUser } from '@/lib/discord/util'
import { log } from '@/log'
import { client } from '@/modules/bot/client'
import { DEFAULT_THEME_POOL, JAM_SUBMISSION_SCORE } from '@/modules/jams/const'
import { SettingsService } from '@/modules/settings/service'
import { Cron } from 'croner'
import {
  type Attachment,
  type GuildMember,
  type Message,
  type MessageCreateOptions,
  type MessagePayload,
} from 'discord.js'
import { AnalyticsService } from '../analytics/service'
import { GoogleDriveService } from '../google-drive/service'
import type { SettingsModel } from '../settings/model'
import {
  jamAnnouncementTemplate,
  jamMidweekReminderTemplate,
  jamRecapMessageTemplate,
  jamSubmissionMessageTemplate,
} from './messages'
import { GuildJamModel, JamModel, JamSubmissionModel, ThemePoolModel } from './model'

export abstract class JamService {
  /**
   * Generate a jam and notify all guilds where theme announcement channel exists.
   */
  static async generateJam() {
    const theme = await this.generateRandomTheme()

    const nextDeadline = new Cron(`59 11 * * SUN`).nextRun()
    if (!nextDeadline) {
      throw new Error('Failed to calculate next announcement date')
    }
    const deadlineDate = new Date(nextDeadline)

    const jam = await JamModel.create({
      theme,
      deadline: deadlineDate.getTime(),
    })

    return jam
  }

  /**
   * Send a jam announcement for a guild.
   *
   * This will delete the existing jam announcement message if it exists.
   * The new message will be sent in its place.
   * The message id and link will be saved to db for reference.
   */
  static async sendJamAnnouncement(
    jam: JamModel.Jam,
    guildSettings: SettingsModel.Model,
  ): Promise<Message> {
    if (!guildSettings.themeAnnouncementChannelId) {
      throw new Error('Theme announcement channel not found')
    }

    const message = await this.sendThemeChannelMessage(
      guildSettings.guildId,
      guildSettings.themeAnnouncementChannelId!,
      jamAnnouncementTemplate({ theme: jam.theme, deadline: new Date(jam.deadline) }),
    )

    await GuildJamModel.set({
      data: {
        guildId: guildSettings.guildId,
        jamId: jam.id,
        messageId: message.id,
        messageLink: message.url,
      },
    })

    return message
  }

  /**
   * resend a jam announcement for a guild.
   *
   * This will create a new jam announcement message and send it to the theme announcement channel.
   * The message id and link will be saved to db for reference.
   */
  static async resendJamAnnouncement(guildId: string) {
    const guildSettings = await SettingsService.getGuildSettings(guildId)
    if (!guildSettings.themeAnnouncementChannelId) {
      throw new Error('Theme announcement channel not found')
    }

    const jam = await JamModel.getCurrentJam()
    if (!jam) {
      throw new Error('No current jam found')
    }

    const guildJam = await GuildJamModel.getByJamIdAndGuildId({
      jamId: jam.id,
      guildId: guildSettings.guildId,
    })

    if (guildJam?.messageId) {
      await client.channels
        .fetch(guildSettings.themeAnnouncementChannelId)
        .then((channel) =>
          channel?.isTextBased() ? channel.messages.fetch(guildJam.messageId!) : null,
        )
        .then((message) => message?.delete())
        .catch((error) => {
          log.error({ error }, 'Failed to delete jam announcement message')
          throw new Error('Failed to delete jam announcement message')
        })
    }

    return await this.sendJamAnnouncement(jam, guildSettings)
  }

  static async sendJamMidweekReminderToGuild(
    jam: JamModel.Jam,
    guildSettings: SettingsModel.Model,
  ) {
    if (!guildSettings.themeAnnouncementChannelId) {
      throw new Error('Theme announcement channel not found. This should not happen.')
    }

    const guildJam = await GuildJamModel.getByJamIdAndGuildId({
      jamId: jam.id,
      guildId: guildSettings.guildId,
    })

    if (!guildJam) {
      // this means that a jam was never announce for this guild... it can happen when they add the bot mid week and don't run /theme. For now, just ignore it..
      return
    }

    await this.sendThemeChannelMessage(
      guildSettings.guildId,
      guildSettings.themeAnnouncementChannelId!,
      jamMidweekReminderTemplate({ guildJam: guildJam }),
    )
  }

  static async sendJamRecapMessageToGuild(
    jam: JamModel.Jam,
    guildSettings: SettingsModel.Model,
  ): Promise<void> {
    if (!guildSettings.themeAnnouncementChannelId) {
      throw new Error('Theme announcement channel not found. This should not happen.')
    }

    const guildJam = await GuildJamModel.getByJamIdAndGuildId({
      jamId: jam.id,
      guildId: guildSettings.guildId,
    })

    if (!guildJam) {
      // this means that a jam was never announce for this guild... it can happen when they add the bot mid week and don't run /theme. For now, just ignore it..
      return
    }

    const submissions = await JamSubmissionModel.getAllSubmissionsForJam({ jamId: jam.id })

    await this.sendThemeChannelMessage(
      guildSettings.guildId,
      guildSettings.themeAnnouncementChannelId!,
      jamRecapMessageTemplate({ guildJam: guildJam, submissions }),
    )
  }

  /**
   * Handle a theme submission.
   */
  static async handleThemeSubmission(
    fields: {
      submissions: Attachment[]
      description: string | undefined
      title: string | undefined
      shareGlobally: boolean
      shareGuilds: boolean
    },
    message: Message,
    user: GuildMember,
  ) {
    const { submissions, description, title, shareGlobally, shareGuilds } = fields
    const guildJam = await GuildJamModel.getByMessageId({ messageId: message.id })

    if (!guildJam) {
      throw new Error('Failed to get guild jam by message id')
    }

    const jam = guildJam.jam
    const jamId = jam.id

    const submission = await JamSubmissionModel.create(
      {
        userId: user.id,
        username: user.nickname ?? user.user.username,
        themeId: jamId,
        description,
        title,
        shareGlobally,
        shareGuilds,
      },
      submissions.map((submission) => ({
        url: submission.url,
        contentType: submission.contentType ?? '',
        name: submission.name,
      })),
    )

    const guildsToShareWith = shareGuilds
      ? (await findAllGuildsInCommonWithUser(client, user.id)).map((guild) => guild.id)
      : [message.guildId!]

    AnalyticsService.captureEvent({
      event: 'theme_submission',
      properties: {
        guildsToShareWithCount: guildsToShareWith.length,
        attachmentsCount: submissions.length,
        hasTitle: !!title,
        hasDescription: !!description,
        shareGlobally: shareGlobally,
        shareGuilds: shareGuilds,
      },
    })

    for (const guildId of guildsToShareWith) {
      const guildSettings = await SettingsService.getGuildSettings(guildId)
      if (!guildSettings.themeAnnouncementChannelId) {
        continue
      }

      const guildJam = await GuildJamModel.getByJamIdAndGuildId({
        jamId: jamId,
        guildId: guildId,
      })

      if (!guildJam) {
        continue
      }

      await this.sendThemeChannelMessage(
        guildId,
        guildSettings.themeAnnouncementChannelId!,
        jamSubmissionMessageTemplate({ guildJam, submission }),
      )

      // Upload to Google Drive for each guild that has it enabled
      if (guildSettings.googleDriveEnabled) {
        if (!guildJam.themeSubmissionFolderId) {
          const themeSubmissionFolderId = await this.createThemeSubmissionFolderForJam({
            ...guildSettings,
            jamId: jamId,
            theme: jam.theme,
            jamDate: jam.createdAt,
          })
          if (!themeSubmissionFolderId) {
            throw new Error('Failed to create theme submission folder')
          }
          guildJam.themeSubmissionFolderId = themeSubmissionFolderId
        }

        const themeSubmissionFolderId = guildJam.themeSubmissionFolderId

        await Promise.all(
          submission.attachments.map(async (attachment) => {
            const id = await GoogleDriveService.uploadAttachmentToGoogleDriveFolder(
              attachment,
              user.nickname ?? user.user.username,
              themeSubmissionFolderId,
            )
            await JamSubmissionModel.createGuildFileId({
              submissionAttachmentId: attachment.id,
              guildId: guildId,
              googleDriveFileId: id,
            })
          }),
        )
      }
    }
  }

  static async calculateUserStreakInGuild(userId: string): Promise<number> {
    const jams = await JamModel.getJamsWithUserSubmissionForUserId({
      userId: userId,
    })

    let streak = 0
    for (const jam of jams) {
      const submissions = jam.submissions
      if (submissions.length === 0) {
        break
      }
      streak++
    }

    return streak
  }

  static async calculateUserAccumulativeScoreInGuild(userId: string): Promise<number> {
    const jams = await JamModel.getJamsWithUserSubmissionForUserId({
      userId: userId,
    })

    let score = 0
    for (const jam of jams) {
      if (jam.submissions.length > 0) {
        score += JAM_SUBMISSION_SCORE
      }
    }

    return score
  }

  /**
   * Helper function that gets the latest jam for a guild if it is active (not past the deadline).
   */
  static async getCurrentJam() {
    const jam = await JamModel.getCurrentJam()
    if (!jam) {
      return null
    }
    return jam
  }

  /**
   * Helper function that gets the latest jam.
   *
   * This include the current jam, but also just the last jam that happened.
   */
  static async getLatestJam() {
    const jam = await JamModel.getLatestJam()
    if (!jam) {
      return null
    }
    return jam
  }

  /**
   * Create a theme submission folder for a jam.
   * If the google drive folder URL is not provided, it will send an error message to the theme announcement channel.
   */
  static async createThemeSubmissionFolderForJam(args: {
    jamId: string
    guildId: string
    themeAnnouncementChannelId?: string | null
    googleDriveFolderURL?: string | null
    theme: string
    jamDate: number
  }): Promise<string | null> {
    const { guildId, themeAnnouncementChannelId, googleDriveFolderURL, theme, jamDate } = args
    if (!googleDriveFolderURL) {
      if (!themeAnnouncementChannelId) {
        log.error({ guildId }, 'No theme announcement channel id and no google drive folder url')
        return null
      }

      await this.sendThemeChannelMessage(
        guildId,
        themeAnnouncementChannelId,
        'ERROR: Google Drive enabled but no folder URL configured',
      )
      return null
    }

    const folderId = await GoogleDriveService.createThemeSubmissionFolder(
      theme,
      new Date(jamDate),
      GoogleDriveService.parseFolderIdFromUrl(googleDriveFolderURL),
    )

    if (!folderId) {
      throw new Error('Failed to create theme submission folder')
    }

    await GuildJamModel.setByJamIdAndGuildId({
      data: { themeSubmissionFolderId: folderId, jamId: args.jamId, guildId: args.guildId },
    })

    return folderId
  }

  /**
   * Generate a random theme from a guild's theme pool.
   */
  private static async generateRandomTheme(): Promise<string> {
    const totalThemeCount = await ThemePoolModel.getThemeCount()

    if (totalThemeCount.length === 0 || !totalThemeCount[0]) {
      throw new Error('Failed to get theme count')
    }

    if (totalThemeCount[0]?.count === 0) {
      await this.setDefaultThemesForGuild()
    }

    const availableThemeCount = await ThemePoolModel.getUnusedThemeCount()

    if (availableThemeCount.length === 0 || !availableThemeCount[0]) {
      throw new Error('Failed to get available theme count')
    }

    if (availableThemeCount[0]?.count === 0) {
      await ThemePoolModel.resetThemeUsage()
    }

    const randomTheme = await ThemePoolModel.getRandomForGuild()

    if (randomTheme.length === 0 || !randomTheme[0]) {
      throw new Error('Failed to get random theme')
    }

    await ThemePoolModel.setThemeAsUsed({ theme: randomTheme[0].theme })

    return randomTheme[0].theme
  }

  /**
   * Set the default available themes for a guild.
   */
  private static async setDefaultThemesForGuild(): Promise<void> {
    await ThemePoolModel.insertThemes({ themes: DEFAULT_THEME_POOL })
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
