import { client } from '@/client'
import { data } from '@/db/data'
import { getCurrentDayOfTheWeek } from '@/lib/date'
import { log } from '@/log'
import { SettingsService } from '@/modules/settings/service'
import { DEFAULT_THEME_POOL } from '@/modules/theme/const'
import {
  ComponentType,
  type APIInteractionGuildMember,
  type Attachment,
  type GuildMember,
  type Message,
  type MessageCreateOptions,
  type MessagePayload,
} from 'discord.js'
import { themeAnnouncementTemplate, themeSubmissionMessageTemplate } from './messages'

export abstract class ThemeService {
  /**
   * Generate a theme for all guilds that have a theme announcement channel and the current day of the week is the same as the theme announcement day.
   */
  static async generateThemeForAllGuilds(): Promise<void> {
    const currentDayOfTheWeek = getCurrentDayOfTheWeek()
    const allGuildSettings = await SettingsService.getAllByThemeAnnouncementDay(currentDayOfTheWeek)

    for (const guildSettings of allGuildSettings) {
      const theme = await this.generateGuildTheme(guildSettings.guildId)
      if (theme instanceof Error) {
        continue
      }
      await this.sendThemeChannelMessage(
        guildSettings.guildId,
        guildSettings.themeAnnouncementChannelId!,
        themeAnnouncementTemplate({ theme }),
      )
    }
  }

  /**
   * Force generate a theme for a guild.
   */
  static async forceGenerateThemeForGuild(guildId: string): Promise<void | Error> {
    const guildSettings = await SettingsService.getGuildSettings(guildId)

    if (!guildSettings.themeAnnouncementChannelId) {
      return new Error('Theme announcement channel not found')
    }

    const theme = await this.generateGuildTheme(guildId)
    if (theme instanceof Error) {
      return theme
    }
    await this.sendThemeChannelMessage(
      guildId,
      guildSettings.themeAnnouncementChannelId!,
      themeAnnouncementTemplate({ theme }),
    )
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
    user: GuildMember | APIInteractionGuildMember,
  ) {
    const { submissions, description } = fields
    const theme = await this.parseThemeFromMessage(message)
    if (theme instanceof Error) {
      log.error({ message }, 'Failed to parse theme from message')
      return theme
    }

    await this.sendThemeChannelMessage(
      message.guildId!,
      message.channelId!,
      themeSubmissionMessageTemplate({ theme, submissions, description }),
    )
  }

  /**
   * Generate a theme for a guild.
   */
  private static async generateGuildTheme(guildId: string): Promise<string | Error> {
    const totalThemeCount = await data.availableThemes.getGuildThemeCount({
      guildId,
    })

    if (totalThemeCount.length === 0 || !totalThemeCount[0]) {
      return new Error('Failed to get theme count')
    }

    if (totalThemeCount[0]?.count === 0) {
      await this.setDefaultThemesForGuild(guildId)
    }

    const availableThemeCount = await data.availableThemes.getGuildUnusedThemeCount({
      guildId,
    })

    if (availableThemeCount.length === 0 || !availableThemeCount[0]) {
      return new Error('Failed to get available theme count')
    }

    if (availableThemeCount[0]?.count === 0) {
      await data.availableThemes.resetThemeUsageForGuild({ guildId })
    }

    const randomTheme = await data.availableThemes.getRandomForGuild({ guildId })

    if (randomTheme.length === 0 || !randomTheme[0]) {
      return new Error('Failed to get random theme')
    }

    await data.availableThemes.setThemeAsUsed({
      guildId,
      theme: randomTheme[0].theme,
    })

    return randomTheme[0].theme
  }

  /**
   * Parse the theme from the message.
   *
   * Reading the theme from the message content is kind of hacky, but it seems like the best way to do it for now.
   */
  private static async parseThemeFromMessage(message: Message): Promise<string | Error> {
    let theme: string | undefined
    for (const component of message.components) {
      if (component.type === ComponentType.TextDisplay) {
        theme = component.content.match(/New Theme: \[(.*)\]/)?.[1]
        if (theme) {
          break
        }
      }
    }
    if (!theme) {
      return new Error('Failed to parse theme from message')
    }
    return theme
  }

  /**
   * Set the default available themes for a guild.
   */
  private static async setDefaultThemesForGuild(guildId: string): Promise<void> {
    await data.availableThemes.deleteGuildThemes({ guildId })
    await data.availableThemes.insertGuildThemes({ guildId, themes: DEFAULT_THEME_POOL })
  }

  /**
   * Send a message to the theme announcement channel.
   */
  private static async sendThemeChannelMessage(
    guildId: string,
    channelId: string,
    message: string | MessagePayload | MessageCreateOptions,
  ): Promise<void> {
    const guild = await client.guilds.fetch(guildId)
    const channel = await guild.channels.fetch(channelId)
    if (!channel || !channel.isTextBased()) {
      log.error({ channelId }, 'Failed to send message. Channel is not text based.')
      return
    }

    if (channel.isSendable()) {
      await channel.send(message)
    } else {
      log.error({ channelId }, 'Failed to send message. Channel is not sendable.')
    }
  }
}
