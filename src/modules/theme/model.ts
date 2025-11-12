import { db } from '@/db'
import { themeAnnouncementTable, themePoolTable, themeSubmissionsTable } from '@/db/schema'
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
  export type Model = InferSelectModel<typeof themePoolTable>
  export type InsertModel = InferInsertModel<typeof themePoolTable>

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

export namespace ThemeSubmissionModel {
  export type Model = InferSelectModel<typeof themeSubmissionsTable>
  export type InsertModel = InferInsertModel<typeof themeSubmissionsTable>

  export async function create(themeSubmission: InsertModel) {
    await db.insert(themeSubmissionsTable).values(themeSubmission)
  }

  export async function getUserSubmissions({ userId }: { userId: string }) {
    return await db
      .select()
      .from(themeSubmissionsTable)
      .where(and(eq(themeSubmissionsTable.userId, userId), isNull(themeSubmissionsTable.createdAt)))
      .orderBy(desc(themeSubmissionsTable.createdAt))
  }
}

export namespace ThemeAnnouncementModel {
  export type Model = InferSelectModel<typeof themeAnnouncementTable>
  export type InsertModel = InferInsertModel<typeof themeAnnouncementTable>

  export async function create(themeAnnouncement: InsertModel) {
    await db.insert(themeAnnouncementTable).values(themeAnnouncement)
  }

  export async function getByMessageId({ messageId }: { messageId: string }) {
    return await db
      .select()
      .from(themeAnnouncementTable)
      .where(eq(themeAnnouncementTable.messageId, messageId))
      .limit(1)
  }
}
