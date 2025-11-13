import { drive } from '@/google'
import type { Attachment } from 'discord.js'
import { Readable } from 'node:stream'

export abstract class GoogleDriveService {
  static async uploadAttachmentToGoogleDriveFolder(
    attachments: Attachment[],
    username: string,
    parent_directory_id: string,
  ) {
    return await Promise.all(
      attachments.map(async (attachment) => {
        const body = await fetch(attachment.url).then((response) => response.body)
        if (!body) {
          throw new Error('Failed to fetch attachment body')
        }

        if (!attachment.contentType) {
          throw new Error('Attachment content type not found')
        }

        return drive.files.create({
          requestBody: {
            name: `${username} - ${attachment.name}`,
            parents: [parent_directory_id],
          },
          media: {
            mimeType: attachment.contentType,
            body: Readable.from(body),
          },
          fields: 'id',
        })
      }),
    )
  }

  static async createThemeSubmissionFolder(theme: string, date: Date, parent_directory_id: string) {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    const name = `${month}/${day}/${year} - ${theme}`

    return await drive.files
      .create({
        requestBody: {
          name,
          parents: [parent_directory_id],
          mimeType: 'application/vnd.google-apps.folder',
        },
      })
      .then((response) => {
        return response.data.id ?? null
      })
  }

  static parseFolderIdFromUrl(url: string): string {
    // eslint-disable-next-line no-useless-escape -- this is a valid regex
    const match = url.match(/folders\/([^\/?]+)/)
    if (!match || !match[1]) {
      throw new Error('Failed to parse folder id from url')
    }
    return match[1]
  }
}
