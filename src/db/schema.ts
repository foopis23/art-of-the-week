import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { Day } from '../lib/date'

export const themePoolTable = sqliteTable('theme_pool', {
  id: text('id')
    .primaryKey()
    .$default(() => crypto.randomUUID())
    .notNull(),
  guildId: text('guild_id').notNull(),
  theme: text('theme').notNull(),
  usedAt: integer('used_at'),
  createdAt: integer('created_at')
    .notNull()
    .$default(() => new Date().getTime()),
})

export const settingsTable = sqliteTable('settings', {
  guildId: text('guild_id').primaryKey().notNull(),
  themeAnnouncementChannelId: text('theme_announcement_channel_id'),
  themeAnnouncementDay: text('theme_announcement_day').$type<Day>().default('SUN'),
  createdAt: integer('created_at')
    .notNull()
    .$default(() => new Date().getTime()),
})

export const themeAnnouncementTable = sqliteTable(
  'announced_themes',
  {
    id: text('id')
      .primaryKey()
      .$default(() => crypto.randomUUID())
      .notNull(),
    guildId: text('guild_id').notNull(),
    theme: text('theme').notNull(),
    messageId: text('message_id').notNull(),
    deadline: integer('deadline').notNull(),
    createdAt: integer('created_at')
      .notNull()
      .$default(() => new Date().getTime()),
  },
  (table) => [index('message_id').on(table.messageId)],
)

export const themeSubmissionsTable = sqliteTable(
  'theme_submissions',
  {
    id: text('id')
      .primaryKey()
      .$default(() => crypto.randomUUID())
      .notNull(),
    guildId: text('guild_id').notNull(),
    userId: text('user_id').notNull(),
    username: text('username').notNull(),
    themeId: text('theme_id')
      .notNull()
      .references(() => themeAnnouncementTable.id),
    description: text('description'),
    createdAt: integer('created_at')
      .notNull()
      .$default(() => new Date().getTime()),
  },
  (table) => [
    index('guild_id_user_id').on(table.guildId, table.userId),
    index('theme_id').on(table.themeId),
  ],
)

export const submissionAttachmentsTable = sqliteTable('submission_files', {
  id: text('id')
    .primaryKey()
    .$default(() => crypto.randomUUID())
    .notNull(),
  submissionId: text('submission_id')
    .notNull()
    .references(() => themeSubmissionsTable.id),
  url: text('file_url').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .$default(() => new Date().getTime()),
})
