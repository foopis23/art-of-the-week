import { and, count, eq, isNull, sql, type InferInsertModel } from 'drizzle-orm'
import { db } from '.'
import type { Day } from '../lib/date'
import { settingsTable, themePoolTable } from './schema'

/**
 * Data layer for the application.
 */
export const data = {
  guildSettings: {
    create: async (settings: InferInsertModel<typeof settingsTable>) => {
      await db.insert(settingsTable).values(settings)
    },
    getAllByThemeAnnouncementDay: async ({ day }: { day: Day }) => {
      return await db
        .select()
        .from(settingsTable)
        .where(eq(settingsTable.themeAnnouncementDay, day))
    },
    getByGuildId: async ({ guildId }: { guildId: string }) => {
      return await db
        .select()
        .from(settingsTable)
        .where(eq(settingsTable.guildId, guildId))
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
        .insert(settingsTable)
        .values({ guildId, themeAnnouncementChannelId: channelId })
        .onConflictDoUpdate({
          target: settingsTable.guildId,
          set: { themeAnnouncementChannelId: channelId },
        })
    },
  },
  availableThemes: {
    getRandomForGuild: async ({ guildId }: { guildId: string }) => {
      return await db
        .select()
        .from(themePoolTable)
        .where(and(eq(themePoolTable.guildId, guildId), isNull(themePoolTable.usedAt)))
        .orderBy(sql`RANDOM()`)
        .limit(1)
    },
    getGuildThemeCount: async ({ guildId }: { guildId: string }) => {
      return await db
        .select({ count: count() })
        .from(themePoolTable)
        .where(eq(themePoolTable.guildId, guildId))
    },
    getGuildUnusedThemeCount: async ({ guildId }: { guildId: string }) => {
      return await db
        .select({ count: count() })
        .from(themePoolTable)
        .where(and(eq(themePoolTable.guildId, guildId), isNull(themePoolTable.usedAt)))
    },
    insertGuildThemes: async ({ guildId, themes }: { guildId: string; themes: string[] }) => {
      return await db.insert(themePoolTable).values(themes.map((theme) => ({ guildId, theme })))
    },
    deleteGuildThemes: async ({ guildId }: { guildId: string }) => {
      return await db.delete(themePoolTable).where(eq(themePoolTable.guildId, guildId))
    },
    resetThemeUsageForGuild: async ({ guildId }: { guildId: string }) => {
      return await db
        .update(themePoolTable)
        .set({ usedAt: null })
        .where(eq(themePoolTable.guildId, guildId))
    },
    setThemeAsUsed: async ({ guildId, theme }: { guildId: string; theme: string }) => {
      return await db
        .update(themePoolTable)
        .set({ usedAt: new Date().getTime() })
        .where(and(eq(themePoolTable.guildId, guildId), eq(themePoolTable.theme, theme)))
    },
  },
}
