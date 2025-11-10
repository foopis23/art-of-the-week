import { client } from '@/client'
import { data } from '@/db/data'
import { getCurrentDayOfTheWeek } from '@/lib/date'
import { log } from '@/log'
import { SettingsService } from '@/modules/settings/service'
import { DEFAULT_THEME_POOL } from '@/modules/theme/const'
import { themeAnnouncementTemplate } from '@/modules/theme/view'

export abstract class ThemeService {
  /**
   * Generate a theme for a guild.
   */
  static async generateGuildTheme(guildId: string): Promise<string | Error> {
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
      await this.sendThemeAnnouncement(
        guildSettings.guildId,
        guildSettings.themeAnnouncementChannelId!,
        theme,
      )
    }
  }

  static async forceGenerateThemeForGuild(guildId: string): Promise<void | Error> {
    const guildSettings = await SettingsService.getGuildSettings(guildId)

    if (!guildSettings.themeAnnouncementChannelId) {
      return new Error('Theme announcement channel not found')
    }

    const theme = await this.generateGuildTheme(guildId)
    if (theme instanceof Error) {
      return theme
    }
    await this.sendThemeAnnouncement(guildId, guildSettings.themeAnnouncementChannelId!, theme)
  }

  private static async setDefaultThemesForGuild(guildId: string): Promise<void> {
    await data.availableThemes.deleteGuildThemes({ guildId })
    await data.availableThemes.insertGuildThemes({ guildId, themes: DEFAULT_THEME_POOL })
  }

  /**
   * Send a theme announcement to a channel.
   */
  private static async sendThemeAnnouncement(
    guildId: string,
    channelId: string,
    theme: string,
  ): Promise<void> {
    const guild = await client.guilds.fetch(guildId)
    const channel = await guild.channels.fetch(channelId)
    if (!channel || !channel.isTextBased()) {
      return
    }

    if (channel.isSendable()) {
      await channel.send(themeAnnouncementTemplate({ theme }))
    } else {
      log.error({ channelId, theme }, 'Failed to send theme announcement. Channel is not sendable.')
    }
  }
}
