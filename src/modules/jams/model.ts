import { db } from '@/db'
import {
  guildJamsTable,
  jamsTable,
  jamSubmissionAttachmentGuildFilesTable,
  jamSubmissionAttachmentsTable,
  jamSubmissionTable,
  themePoolTable,
} from '@/db/schema'
import {
  and,
  count,
  desc,
  eq,
  gt,
  isNull,
  sql,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm'
import z from 'zod'

export namespace ThemePoolModel {
  export type Theme = InferSelectModel<typeof themePoolTable>
  export type InsertTheme = InferInsertModel<typeof themePoolTable>

  export async function getRandomForGuild() {
    return await db
      .select()
      .from(themePoolTable)
      .where(isNull(themePoolTable.usedAt))
      .orderBy(sql`RANDOM()`)
      .limit(1)
  }

  export async function getThemeCount() {
    return await db.select({ count: count() }).from(themePoolTable)
  }

  export async function getUnusedThemeCount() {
    return await db.select({ count: count() }).from(themePoolTable)
  }

  export async function insertThemes({ themes }: { themes: string[] }) {
    return await db
      .insert(themePoolTable)
      .values(themes.map((theme) => ({ theme })))
      .onConflictDoNothing()
  }

  export async function resetThemeUsage() {
    return await db.update(themePoolTable).set({ usedAt: null })
  }

  export async function setThemeAsUsed({ theme }: { theme: string }) {
    return await db
      .update(themePoolTable)
      .set({ usedAt: new Date().getTime() })
      .where(eq(themePoolTable.theme, theme))
  }
}

export namespace JamSubmissionModel {
  export type JamSubmission = InferSelectModel<typeof jamSubmissionTable>
  export type InsertJamSubmission = InferInsertModel<typeof jamSubmissionTable>
  export type JamSubmissionAttachments = InferSelectModel<typeof jamSubmissionAttachmentsTable>
  export type InsertJamSubmissionAttachment = InferInsertModel<typeof jamSubmissionAttachmentsTable>

  export type JamSubmissionWithAttachments = InferSelectModel<typeof jamSubmissionTable> & {
    attachments: JamSubmissionAttachments[]
  }

  export async function create(
    themeSubmission: InsertJamSubmission,
    attachments: Omit<InsertJamSubmissionAttachment, 'submissionId'>[],
  ) {
    const result = await db.insert(jamSubmissionTable).values(themeSubmission).returning()

    if (result.length === 0 || !result[0]?.id) {
      throw new Error('Failed to create jam submission')
    }

    const submission = result[0]
    if (!submission) {
      throw new Error('Failed to create jam submission')
    }

    const jamSubmissionAttachments = await db
      .insert(jamSubmissionAttachmentsTable)
      .values(attachments.map((attachment) => ({ ...attachment, submissionId: submission.id })))
      .returning()

    return {
      ...submission,
      attachments: jamSubmissionAttachments,
    }
  }

  export async function getUserSubmissions({ userId }: { userId: string }) {
    return await db.query.jamSubmissionTable.findMany({
      with: {
        attachments: true,
      },
      where: eq(jamSubmissionTable.userId, userId),
      orderBy: desc(jamSubmissionTable.createdAt),
    })
  }

  /**
   * @deprecated Use createGuildFileId instead. This is kept for backward compatibility.
   */
  export async function updateAttachmentsGoogleDriveFileId({
    submissionAttachmentId,
    googleDriveFileId,
  }: {
    submissionAttachmentId: string
    googleDriveFileId: string
  }) {
    return await db
      .update(jamSubmissionAttachmentsTable)
      .set({ googleDriveFileId: googleDriveFileId })
      .where(eq(jamSubmissionAttachmentsTable.id, submissionAttachmentId))
  }

  /**
   * Create a guild-specific Google Drive file ID for a submission attachment.
   * This allows the same attachment to be uploaded to multiple guild folders.
   */
  export async function createGuildFileId({
    submissionAttachmentId,
    guildId,
    googleDriveFileId,
  }: {
    submissionAttachmentId: string
    guildId: string
    googleDriveFileId: string
  }) {
    return await db
      .insert(jamSubmissionAttachmentGuildFilesTable)
      .values({
        submissionAttachmentId,
        guildId,
        googleDriveFileId,
      })
      .onConflictDoUpdate({
        target: [
          jamSubmissionAttachmentGuildFilesTable.submissionAttachmentId,
          jamSubmissionAttachmentGuildFilesTable.guildId,
        ],
        set: { googleDriveFileId },
      })
  }

  export async function getAllSubmissionsForJam({ jamId }: { jamId: string }) {
    return await db.query.jamSubmissionTable.findMany({
      with: {
        attachments: true,
      },
      where: eq(jamSubmissionTable.themeId, jamId),
    })
  }
}

export namespace JamModel {
  export type Jam = InferSelectModel<typeof jamsTable>
  export type InsertJam = InferInsertModel<typeof jamsTable>

  export const jamSchema = z.object({
    createdAt: z.number(),
    id: z.string(),
    theme: z.string(),
    deadline: z.number(),
  })

  export async function getCurrentJam() {
    return await db.query.jamsTable.findFirst({
      orderBy: desc(jamsTable.createdAt),
      where: gt(jamsTable.deadline, new Date().getTime()),
    })
  }

  export async function getLatestJam() {
    return await db.query.jamsTable.findFirst({
      orderBy: desc(jamsTable.createdAt),
    })
  }

  export async function getJamsWithUserSubmissionForUserId({ userId }: { userId: string }) {
    return await db.query.jamsTable.findMany({
      with: {
        submissions: {
          where: eq(jamSubmissionTable.userId, userId),
        },
      },
      orderBy: desc(jamsTable.createdAt),
    })
  }

  export async function create(themeAnnouncement: InsertJam) {
    const result = await db.insert(jamsTable).values(themeAnnouncement).returning()

    if (result.length === 0 || !result[0]?.id) {
      throw new Error('Failed to create jam')
    }

    return result[0]
  }
}

export namespace GuildJamModel {
  export type GuildJam = InferSelectModel<typeof guildJamsTable> & {
    jam: JamModel.Jam
  }
  export type InsertGuildJam = InferInsertModel<typeof guildJamsTable>
  export type UpdateGuildJam = Partial<InsertGuildJam>

  export async function list() {
    return await db.query.guildJamsTable.findMany({
      with: {
        jam: true,
      },
      orderBy: desc(guildJamsTable.createdAt),
    })
  }

  export async function listByGuildId({ guildId }: { guildId: string }) {
    return await db.query.guildJamsTable.findMany({
      where: eq(guildJamsTable.guildId, guildId),
      with: {
        jam: true,
      },
      orderBy: desc(guildJamsTable.createdAt),
    })
  }

  export async function getByMessageId({ messageId }: { messageId: string }) {
    return await db.query.guildJamsTable.findFirst({
      where: eq(guildJamsTable.messageId, messageId),
      with: {
        jam: true,
      },
      orderBy: desc(guildJamsTable.createdAt),
    })
  }

  export async function listByJamId({ jamId }: { jamId: string }) {
    // return await db
    //   .select()
    //   .from(guildJamsTable)
    //   .where(eq(guildJamsTable.jamId, jamId))
    //   .orderBy(desc(guildJamsTable.createdAt), desc(guildJamsTable.id))

    return await db.query.guildJamsTable.findMany({
      where: eq(guildJamsTable.jamId, jamId),
      with: {
        jam: true,
      },
      orderBy: desc(guildJamsTable.createdAt),
    })
  }

  export async function getByJamIdAndGuildId({
    jamId,
    guildId,
  }: {
    jamId: string
    guildId: string
  }) {
    return await db.query.guildJamsTable.findFirst({
      where: and(eq(guildJamsTable.jamId, jamId), eq(guildJamsTable.guildId, guildId)),
      with: {
        jam: true,
      },
      orderBy: desc(guildJamsTable.createdAt),
    })
  }

  export async function getByJamIdAndGuildIdAndMessageId({
    jamId,
    guildId,
    messageId,
  }: {
    jamId: string
    guildId: string
    messageId: string
  }) {
    return await db.query.guildJamsTable.findFirst({
      where: and(
        eq(guildJamsTable.jamId, jamId),
        eq(guildJamsTable.guildId, guildId),
        eq(guildJamsTable.messageId, messageId),
      ),
      with: {
        jam: true,
      },
      orderBy: desc(guildJamsTable.createdAt),
    })
  }

  export async function create(guildJam: InsertGuildJam) {
    const result = await db.insert(guildJamsTable).values(guildJam).returning()

    if (result.length === 0 || !result[0]?.id) {
      throw new Error('Failed to create guild jam')
    }

    return result[0]
  }

  /**
   * Upsert a guild jam.
   */
  export async function set({ data }: { data: InsertGuildJam }) {
    return await db
      .insert(guildJamsTable)
      .values(data)
      .onConflictDoUpdate({
        target: [guildJamsTable.guildId, guildJamsTable.jamId],
        set: data,
      })
  }

  export async function setByJamIdAndGuildId({ data }: { data: InsertGuildJam }) {
    return await db
      .insert(guildJamsTable)
      .values(data)
      .onConflictDoUpdate({
        target: [guildJamsTable.jamId, guildJamsTable.guildId],
        set: data,
      })
  }

  export async function update({ id, data }: { id: string; data: UpdateGuildJam }) {
    return await db.update(guildJamsTable).set(data).where(eq(guildJamsTable.id, id))
  }

  export async function deleteById({ id }: { id: string }) {
    return await db.delete(guildJamsTable).where(eq(guildJamsTable.id, id))
  }
}
