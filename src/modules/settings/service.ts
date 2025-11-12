import type { Day } from '@/lib/date'
import { SettingsModel } from './model'

export abstract class SettingsService {
  private static createDefaultSettingsObject(guildId: string): SettingsModel.Model {
    return {
      guildId,
      themeAnnouncementChannelId: null,
      themeAnnouncementDay: 'SUN',
      googleDriveFolderURL: null,
      streaksMode: 'disabled',
      createdAt: new Date().getTime(),
    }
  }

  static async getGuildSettings(guildId: string): Promise<SettingsModel.Model> {
    const settings = await SettingsModel.getByGuildId({ guildId })
    if (settings.length === 0 || !settings[0]) {
      const defaultSettings = this.createDefaultSettingsObject(guildId)
      await SettingsModel.create(defaultSettings)
      return defaultSettings
    }
    return settings[0]
  }

  static async getAllByThemeAnnouncementDay(day: Day): Promise<SettingsModel.Model[]> {
    return await SettingsModel.getAllByThemeAnnouncementDay({ day })
  }

  static async setThemeAnnouncementChannel(guildId: string, channelId: string): Promise<void> {
    await SettingsModel.setThemeAnnouncementChannel({ guildId, channelId })
  }
}
