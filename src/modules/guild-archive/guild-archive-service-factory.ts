import type { SettingsModel } from '../settings/model'
import type { GuildArchiveStrategy } from './guild-archive-strategy'
import { GoogleDriveGuildArchiveService } from './strategies/google-drive-strategy'

export class GuildArchiveStrategyFactory {
  /**
   * Create a guild archive service based on the configuration.
   *
   * If no archive service is configured, return null.
   */
  static createGuildArchiveService(config: SettingsModel.Model): GuildArchiveStrategy | null {
    if (config.googleDriveEnabled) {
      return new GoogleDriveGuildArchiveService({
        googleDriveFolderURL: config.googleDriveFolderURL!,
      })
    }

    return null
  }
}
