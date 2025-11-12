import { db } from '@/db'
import {
  jamsTable,
  jamSubmissionAttachmentsTable,
  jamSubmissionTable,
  themePoolTable,
} from '@/db/schema'
import {
  and,
  count,
  desc,
  eq,
  isNull,
  sql,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm'

export namespace ThemePoolModel {
  export type Theme = InferSelectModel<typeof themePoolTable>
  export type InsertTheme = InferInsertModel<typeof themePoolTable>

  export async function getRandomForGuild({ guildId }: { guildId: string }) {
    return await db
      .select()
      .from(themePoolTable)
      .where(and(eq(themePoolTable.guildId, guildId), isNull(themePoolTable.usedAt)))
      .orderBy(sql`RANDOM()`)
      .limit(1)
  }

  export async function getGuildThemeCount({ guildId }: { guildId: string }) {
    return await db
      .select({ count: count() })
      .from(themePoolTable)
      .where(eq(themePoolTable.guildId, guildId))
  }

  export async function getGuildUnusedThemeCount({ guildId }: { guildId: string }) {
    return await db
      .select({ count: count() })
      .from(themePoolTable)
      .where(and(eq(themePoolTable.guildId, guildId), isNull(themePoolTable.usedAt)))
  }

  export async function insertGuildThemes({
    guildId,
    themes,
  }: {
    guildId: string
    themes: string[]
  }) {
    return await db.insert(themePoolTable).values(themes.map((theme) => ({ guildId, theme })))
  }

  export async function deleteGuildThemes({ guildId }: { guildId: string }) {
    return await db.delete(themePoolTable).where(eq(themePoolTable.guildId, guildId))
  }

  export async function resetThemeUsageForGuild({ guildId }: { guildId: string }) {
    return await db
      .update(themePoolTable)
      .set({ usedAt: null })
      .where(eq(themePoolTable.guildId, guildId))
  }

  export async function setThemeAsUsed({ guildId, theme }: { guildId: string; theme: string }) {
    return await db
      .update(themePoolTable)
      .set({ usedAt: new Date().getTime() })
      .where(and(eq(themePoolTable.guildId, guildId), eq(themePoolTable.theme, theme)))
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
    const result = await db
      .insert(jamSubmissionTable)
      .values(themeSubmission)
      .returning({ id: jamSubmissionTable.id })

    if (result.length === 0 || !result[0]?.id) {
      throw new Error('Failed to create jam submission')
    }

    const submissionId = result[0].id

    await db
      .insert(jamSubmissionAttachmentsTable)
      .values(attachments.map((attachment) => ({ ...attachment, submissionId: submissionId })))
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
}

export namespace JamModel {
  export type Jam = InferSelectModel<typeof jamsTable>
  export type InsertJam = InferInsertModel<typeof jamsTable>

  export async function create(themeAnnouncement: InsertJam) {
    await db.insert(jamsTable).values(themeAnnouncement)
  }

  export async function getByMessageId({ messageId }: { messageId: string }) {
    return await db.select().from(jamsTable).where(eq(jamsTable.messageId, messageId)).limit(1)
  }

  export async function getAllJamsWithUserSubmissionForGuild(args: {
    guildId: string
    userId: string
  }) {
    const { guildId, userId } = args

    return await db.query.jamsTable.findMany({
      with: {
        submissions: {
          columns: {
            userId: true,
          },
        },
      },
      where: and(eq(jamsTable.guildId, guildId), eq(jamSubmissionTable.userId, userId)),
      orderBy: desc(jamsTable.createdAt),
    })
  }
}
