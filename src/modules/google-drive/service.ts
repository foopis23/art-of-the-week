import { drive } from '@/lib/google/drive'
import type { Attachment } from 'discord.js'

export abstract class GoogleDriveService {
  static async uploadAttachmentToGoogleDriveFolder(
    attachments: Attachment[],
    parent_directory_id: string,
  ) {
    return await Promise.all(
      attachments.map(async (attachment) => {
        return await drive.files.create({
          requestBody: {
            name: attachment.name,
            parents: [parent_directory_id],
          },
        })
      }),
    )
  }

  static async createThemeSubmissionFolder(theme: string, parent_directory_id: string) {
    return await drive.files.create({
      requestBody: {
        name: theme,
        parents: [parent_directory_id],
      },
    })
  }
}
