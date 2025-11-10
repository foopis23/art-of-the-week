import type { guildSettingsTable } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

export namespace SettingsModel {
  export type GuildSettings = InferSelectModel<typeof guildSettingsTable>
}
