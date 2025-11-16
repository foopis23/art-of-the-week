import type { Day } from '@/lib/date'
import {
  generalSettingsModalInteractable,
  googleDriveConfigurationModalInteractable,
} from './messages'
import { SettingsModel } from './model'

export abstract class SettingsService {
  static async getAll(): Promise<SettingsModel.Model[]> {
    return await SettingsModel.getAll()
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

  static async getGeneralSettings(guildId: string): Promise<SettingsModel.GeneralSettings> {
    const result = await SettingsModel.getGeneralSettings({ guildId })

    if (!result) {
      const guildSettings = await this.getGuildSettings(guildId)
      return {
        themeAnnouncementDay: guildSettings.themeAnnouncementDay,
        streaksMode: guildSettings.streaksMode,
        themeAnnouncementChannelId: guildSettings.themeAnnouncementChannelId,
      }
    }

    return result
  }

  static async getGoogleDriveSettings(guildId: string): Promise<SettingsModel.GoogleDriveSettings> {
    const result = await SettingsModel.getGoogleDriveSettings({ guildId })
    if (!result) {
      const guildSettings = await this.getGuildSettings(guildId)
      return {
        googleDriveFolderURL: guildSettings.googleDriveFolderURL,
        googleDriveEnabled: guildSettings.googleDriveEnabled,
      }
    }
    return result
  }

  static async setGeneralSettings(args: SettingsModel.SetGeneralSettings): Promise<void> {
    await SettingsModel.setGeneralSettings(args)
  }

  static async setGoogleDriveSettings(args: SettingsModel.SetGoogleDriveSettings): Promise<void> {
    await SettingsModel.setGoogleDriveSettings(args)
  }

  static async createGeneralSettingsModal({ guildId }: { guildId: string }) {
    const generalSettings = await this.getGeneralSettings(guildId)
    return generalSettingsModalInteractable.component(generalSettings)
  }

  static async createGoogleDriveConfigurationModal({ guildId }: { guildId: string }) {
    const googleDriveSettings = await this.getGoogleDriveSettings(guildId)
    return googleDriveConfigurationModalInteractable.component(googleDriveSettings)
  }

  private static createDefaultSettingsObject(guildId: string): SettingsModel.Model {
    return {
      guildId,
      themeAnnouncementChannelId: null,
      themeAnnouncementDay: 'MON',
      googleDriveFolderURL: null,
      googleDriveEnabled: false,
      streaksMode: 'disabled',
      createdAt: new Date().getTime(),
    }
  }
}
