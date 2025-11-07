import type { InferSelectModel } from 'drizzle-orm'
import type { guildSettingsTable } from '../../db/schema'

export namespace SettingsModel {
  export type GuildSettings = InferSelectModel<typeof guildSettingsTable>
}
