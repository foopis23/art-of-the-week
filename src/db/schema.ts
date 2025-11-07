import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const availableThemesTable = sqliteTable('available_themes', {
  id: integer('id').primaryKey(),
  guildId: text('guild_id').notNull(),
  theme: text('theme').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .$default(() => new Date().getTime()),
})
