import { relations } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { Day } from '../lib/date'

/**
 * Streaks mode for tracking user submissions.
 * - disabled: No streaks tracking
 * - streaks: This will display the number of consecutive submissions by a user.
 * - accumulative: This will give the user a score based on the number of submissions they have made.
 */
export type StreaksMode = 'disabled' | 'streaks' | 'accumulative'

export const settingsTable = sqliteTable('settings', {
  guildId: text('guild_id').primaryKey().notNull(),
  themeAnnouncementChannelId: text('theme_announcement_channel_id'),
  themeAnnouncementDay: text('theme_announcement_day').$type<Day>().default('SUN'),
  googleDriveFolderURL: text('google_drive_folder_url'),
  googleDriveEnabled: integer('google_drive_enabled', { mode: 'boolean' }).default(false).notNull(),
  streaksMode: text('streaks_mode').$type<StreaksMode>().default('disabled').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .$default(() => new Date().getTime()),
})

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

export const jamsTable = sqliteTable(
  'jams',
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

export const jamSubmissionTable = sqliteTable(
  'jam_submissions',
  {
    id: text('id')
      .primaryKey()
      .$default(() => crypto.randomUUID())
      .notNull(),
    guildId: text('guild_id').notNull(),
    userId: text('user_id').notNull(),
    username: text('username').notNull(),
    themeId: text('theme_id').notNull(),
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

export const jamSubmissionAttachmentsTable = sqliteTable('jam_submission_attachments', {
  id: text('id')
    .primaryKey()
    .$default(() => crypto.randomUUID())
    .notNull(),
  submissionId: text('submission_id').notNull(),
  url: text('file_url').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .$default(() => new Date().getTime()),
})

export const jamSubmissionRelations = relations(jamSubmissionTable, ({ many, one }) => ({
  attachments: many(jamSubmissionAttachmentsTable),
  jam: one(jamsTable, {
    fields: [jamSubmissionTable.themeId],
    references: [jamsTable.id],
  }),
}))

export const jamSubmissionAttachmentsRelations = relations(
  jamSubmissionAttachmentsTable,
  ({ one }) => ({
    submission: one(jamSubmissionTable, {
      fields: [jamSubmissionAttachmentsTable.submissionId],
      references: [jamSubmissionTable.id],
    }),
  }),
)

export const jamRelations = relations(jamsTable, ({ many }) => ({
  submissions: many(jamSubmissionTable),
}))
