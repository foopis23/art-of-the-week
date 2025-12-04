export interface GuildArchiveStrategy {
  uploadAttachmentToGuildArchive(
    user: {
      name: string
    },
    attachment: {
      url: string
      contentType: string
      name: string
    },
  ): Promise<void>

  createJamArchiveFolder(jam: { theme: string; createdAt: number }): Promise<void>
}
