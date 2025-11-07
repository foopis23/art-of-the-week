import { and, eq, isNotNull, sql } from 'drizzle-orm/sql'
import { client } from '../../client'
import { db } from '../../db'
import { availableThemesTable, guildSettingsTable } from '../../db/schema'
import { getCurrentDayOfTheWeek } from '../../lib/date'
import { log } from '../../log'

export abstract class ThemeService {
  /**
   * Generate a theme for a guild.
   */
  static async generateGuildTheme(guildId: string): Promise<string | Error> {
    const result = await db
      .select()
      .from(availableThemesTable)
      .where(eq(availableThemesTable.guildId, guildId))
      .orderBy(sql`RANDOM()`)
      .limit(1)

    if (result.length === 0 || !result[0]) {
      return new Error('No themes found')
    }

    return result[0].theme
  }

  /**
   * Generate a theme for all guilds that have a theme announcement channel and the current day of the week is the same as the theme announcement day.
   */
  static async generateThemeForAllGuilds(): Promise<void> {
    const currentDayOfTheWeek = getCurrentDayOfTheWeek()
    const guilds = await db
      .select()
      .from(guildSettingsTable)
      .where(
        and(
          eq(guildSettingsTable.themeAnnouncementDay, currentDayOfTheWeek),
          isNotNull(guildSettingsTable.themeAnnouncementChannelId),
        ),
      )

    for (const guild of guilds) {
      const theme = await this.generateGuildTheme(guild.guildId)
      if (theme instanceof Error) {
        continue
      }
      await this.sendThemeAnnouncement(guild.themeAnnouncementChannelId!, theme)
    }
  }

  /**
   * Send a theme announcement to a channel.
   */
  private static async sendThemeAnnouncement(channelId: string, theme: string): Promise<void> {
    const channel = await client.channels.fetch(channelId)
    if (!channel || !channel.isTextBased()) {
      return
    }

    if (channel.isSendable()) {
      await channel.send({ content: `The theme of the week is ${theme}` })
    } else {
      log.error({ channelId, theme }, 'Failed to send theme announcement. Channel is not sendable.')
    }
  }
}
