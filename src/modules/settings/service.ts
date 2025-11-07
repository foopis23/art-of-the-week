import { eq } from 'drizzle-orm/sql'
import { db } from '../../db'
import { guildSettingsTable } from '../../db/schema'
import type { SettingsModel } from './model'

export abstract class ConfigureService {
  private static async createDefaultSettingsObject(
    guildId: string,
  ): Promise<SettingsModel.GuildSettings> {
    return {
      guildId,
      themeAnnouncementChannelId: null,
      createdAt: new Date().getTime(),
    }
  }

  static async getGuildSettings(guildId: string): Promise<SettingsModel.GuildSettings> {
    const settings = await db
      .select()
      .from(guildSettingsTable)
      .where(eq(guildSettingsTable.guildId, guildId))
      .limit(1)

    if (settings.length === 0 || !settings[0]) {
      return this.createDefaultSettingsObject(guildId)
    }

    return settings[0]
  }

  static async setThemeAnnouncementChannel(
    guildId: string,
    channelId: string,
  ): Promise<void | Error> {
    try {
      await db
        .update(guildSettingsTable)
        .set({ themeAnnouncementChannelId: channelId })
        .where(eq(guildSettingsTable.guildId, guildId))
    } catch (error: unknown) {
      if (error instanceof Error) {
        return error
      }
    }
  }
}
