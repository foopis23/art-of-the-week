import type { GuildArchiveStrategy } from '../guild-archive-strategy'

export class GoogleDriveGuildArchiveService implements GuildArchiveStrategy {
  constructor(private readonly config: { googleDriveFolderURL: string }) {
    if (!this.config.googleDriveFolderURL) {
      throw new Error('Google Drive folder URL is required')
    }
  }

  createJamArchiveFolder(jam: { theme: string; createdAt: number }): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async uploadAttachmentToGuildArchive(
    user: {
      name: string
    },
    attachment: {
      url: string
      contentType: string
      name: string
    },
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
