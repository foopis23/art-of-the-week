import { db } from '@/db'
import { settingsTable } from '@/db/schema'
import type { Day } from '@/lib/date'
import { eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'

export namespace SettingsModel {
  export type Model = InferSelectModel<typeof settingsTable>
  export type InsertModel = InferInsertModel<typeof settingsTable>

  export async function create(settings: InsertModel) {
    await db.insert(settingsTable).values(settings)
  }

  export async function getAllByThemeAnnouncementDay({ day }: { day: Day }) {
    return await db.select().from(settingsTable).where(eq(settingsTable.themeAnnouncementDay, day))
  }

  export async function getByGuildId({ guildId }: { guildId: string }) {
    return await db.select().from(settingsTable).where(eq(settingsTable.guildId, guildId)).limit(1)
  }

  export async function setThemeAnnouncementChannel({
    guildId,
    channelId,
  }: {
    guildId: string
    channelId: string
  }) {
    await db
      .insert(settingsTable)
      .values({ guildId, themeAnnouncementChannelId: channelId })
      .onConflictDoUpdate({
        target: settingsTable.guildId,
        set: { themeAnnouncementChannelId: channelId },
      })
  }
}
