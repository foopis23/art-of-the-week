import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { Day } from '../lib/date'

export const availableThemesTable = sqliteTable('available_themes', {
  id: text('id')
    .primaryKey()
    .$default(() => crypto.randomUUID())
    .notNull(),
  guildId: text('guild_id').notNull(),
  theme: text('theme').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .$default(() => new Date().getTime()),
})

export const guildSettingsTable = sqliteTable('guild_settings', {
  guildId: text('guild_id').primaryKey().notNull(),
  themeAnnouncementChannelId: text('theme_announcement_channel_id'),
  themeAnnouncementDay: text('theme_announcement_day').$type<Day>().default('SUN'),
  createdAt: integer('created_at')
    .notNull()
    .$default(() => new Date().getTime()),
})
