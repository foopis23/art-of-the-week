import { data } from '@/db/data'
import type { Day } from '@/lib/date'
import type { SettingsModel } from './model'

export abstract class SettingsService {
  private static createDefaultSettingsObject(guildId: string): SettingsModel.Model {
    return {
      guildId,
      themeAnnouncementChannelId: null,
      themeAnnouncementDay: 'SUN',
      createdAt: new Date().getTime(),
    }
  }

  static async getGuildSettings(guildId: string): Promise<SettingsModel.Model> {
    const settings = await data.guildSettings.getByGuildId({ guildId })
    if (settings.length === 0 || !settings[0]) {
      const defaultSettings = this.createDefaultSettingsObject(guildId)
      await data.guildSettings.create(defaultSettings)
      return defaultSettings
    }
    return settings[0]
  }

  static async getAllByThemeAnnouncementDay(day: Day): Promise<SettingsModel.Model[]> {
    return await data.guildSettings.getAllByThemeAnnouncementDay({ day })
  }

  static async setThemeAnnouncementChannel(guildId: string, channelId: string): Promise<void> {
    await data.guildSettings.setThemeAnnouncementChannel({ guildId, channelId })
  }
}
