import { eq, sql, type InferInsertModel } from 'drizzle-orm'
import { db } from '.'
import type { Day } from '../lib/date'
import { availableThemesTable, guildSettingsTable } from './schema'

/**
 * Data layer for the application.
 */
export const data = {
  guildSettings: {
    create: async (settings: InferInsertModel<typeof guildSettingsTable>) => {
      await db.insert(guildSettingsTable).values(settings)
    },
    getAllByThemeAnnouncementDay: async ({ day }: { day: Day }) => {
      return await db
        .select()
        .from(guildSettingsTable)
        .where(eq(guildSettingsTable.themeAnnouncementDay, day))
    },
    getByGuildId: async ({ guildId }: { guildId: string }) => {
      return await db
        .select()
        .from(guildSettingsTable)
        .where(eq(guildSettingsTable.guildId, guildId))
        .limit(1)
    },
    setThemeAnnouncementChannel: async ({
      guildId,
      channelId,
    }: {
      guildId: string
      channelId: string
    }) => {
      await db
        .insert(guildSettingsTable)
        .values({ guildId, themeAnnouncementChannelId: channelId })
        .onConflictDoUpdate({
          target: guildSettingsTable.guildId,
          set: { themeAnnouncementChannelId: channelId },
        })
    },
  },
  availableThemes: {
    getRandomForGuild: async ({ guildId }: { guildId: string }) => {
      return await db
        .select()
        .from(availableThemesTable)
        .where(eq(availableThemesTable.guildId, guildId))
        .orderBy(sql`RANDOM()`)
        .limit(1)
    },
    insertGuildThemes: async ({ guildId, themes }: { guildId: string; themes: string[] }) => {
      return await db
        .insert(availableThemesTable)
        .values(themes.map((theme) => ({ guildId, theme })))
    },
    deleteGuildThemes: async ({ guildId }: { guildId: string }) => {
      return await db.delete(availableThemesTable).where(eq(availableThemesTable.guildId, guildId))
    },
  },
}
