import { db } from '@/db'
import { settingsTable, type StreaksMode } from '@/db/schema'
import { eq, isNotNull, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import z from 'zod'

export namespace SettingsModel {
  export type Model = InferSelectModel<typeof settingsTable>
  export type InsertModel = InferInsertModel<typeof settingsTable>

  export type GeneralSettings = Pick<Model, 'streaksMode' | 'themeAnnouncementChannelId'>
  export type SetGeneralSettings = Partial<GeneralSettings> & { guildId: string }
  export type GoogleDriveSettings = Pick<Model, 'googleDriveFolderURL' | 'googleDriveEnabled'>
  export type SetGoogleDriveSettings = Partial<GoogleDriveSettings> & { guildId: string }

  export const guildSettingsSchema = z.object({
    guildId: z.string(),
    themeAnnouncementChannelId: z.string().nullable(),
    googleDriveEnabled: z.boolean(),
    googleDriveFolderURL: z.string().nullable(),
    streaksMode: z.string<StreaksMode>(),
    createdAt: z.number(),
  })

  export async function getAll() {
    return await db.select().from(settingsTable)
  }

  export async function listAllWithThemeAnnouncementChannel() {
    return await db
      .select()
      .from(settingsTable)
      .where(isNotNull(settingsTable.themeAnnouncementChannelId))
  }

  export async function create(settings: InsertModel) {
    await db.insert(settingsTable).values(settings)
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

  export async function getGeneralSettings({
    guildId,
  }: {
    guildId: string
  }): Promise<GeneralSettings | null> {
    return (
      (
        await db.select().from(settingsTable).where(eq(settingsTable.guildId, guildId)).limit(1)
      )[0] ?? null
    )
  }

  export async function setGeneralSettings({
    guildId,
    streaksMode,
    themeAnnouncementChannelId,
  }: SetGeneralSettings) {
    await db
      .insert(settingsTable)
      .values({
        guildId,
        streaksMode: streaksMode,
        themeAnnouncementChannelId: themeAnnouncementChannelId ?? null,
      })
      .onConflictDoUpdate({
        target: settingsTable.guildId,
        set: { streaksMode, themeAnnouncementChannelId },
      })
  }

  export async function getGoogleDriveSettings({
    guildId,
  }: {
    guildId: string
  }): Promise<GoogleDriveSettings | null> {
    return (
      (
        await db.select().from(settingsTable).where(eq(settingsTable.guildId, guildId)).limit(1)
      )[0] ?? null
    )
  }

  export async function setGoogleDriveSettings({
    guildId,
    googleDriveFolderURL = null,
    googleDriveEnabled,
  }: SetGoogleDriveSettings) {
    await db
      .insert(settingsTable)
      .values({
        guildId,
        googleDriveFolderURL: googleDriveFolderURL ?? null,
        googleDriveEnabled: googleDriveEnabled,
      })
      .onConflictDoUpdate({
        target: settingsTable.guildId,
        set: { googleDriveFolderURL, googleDriveEnabled },
      })
  }
}
