import { relations } from 'drizzle-orm'
import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

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
  googleDriveFolderURL: text('google_drive_folder_url'),
  googleDriveEnabled: integer('google_drive_enabled', { mode: 'boolean' }).default(false).notNull(),
  streaksMode: text('streaks_mode').$type<StreaksMode>().default('disabled').notNull(),
  createdAt: integer('created_at')
    .notNull()
    .$default(() => new Date().getTime()),
})

export const themePoolTable = sqliteTable(
  'theme_pool',
  {
    id: text('id')
      .primaryKey()
      .$default(() => crypto.randomUUID())
      .notNull(),
    theme: text('theme').notNull().unique(),
    usedAt: integer('used_at'),
    createdAt: integer('created_at')
      .notNull()
      .$default(() => new Date().getTime()),
  },
  (table) => [index('theme').on(table.theme)],
)

export const jamsTable = sqliteTable(
  'jams',
  {
    id: text('id')
      .primaryKey()
      .$default(() => crypto.randomUUID())
      .notNull(),
    theme: text('theme').notNull(),
    deadline: integer('deadline').notNull(),
    createdAt: integer('created_at')
      .notNull()
      .$default(() => new Date().getTime()),
  },
  (table) => [unique('theme_deadline').on(table.theme, table.deadline)], // unique on theme and deadline
)

/**
 * Table for storing jam information specific to a guild. MessageId, links, etc.
 */
export const guildJamsTable = sqliteTable(
  'guild_jams',
  {
    id: text('id')
      .primaryKey()
      .$default(() => crypto.randomUUID())
      .notNull(),
    guildId: text('guild_id').notNull(),
    jamId: text('jam_id').notNull(),
    messageId: text('message_id'),
    messageLink: text('message_link'),
    themeSubmissionFolderId: text('theme_submission_folder_id'),
    createdAt: integer('created_at')
      .notNull()
      .$default(() => new Date().getTime()),
  },
  (table) => [
    unique('guildid_jamid').on(table.guildId, table.jamId),
    index('guild_id_jam_id').on(table.guildId, table.jamId),
    index('message_id').on(table.messageId),
  ],
)

export const jamSubmissionTable = sqliteTable(
  'jam_submissions',
  {
    id: text('id')
      .primaryKey()
      .$default(() => crypto.randomUUID())
      .notNull(),
    userId: text('user_id').notNull(),
    username: text('username').notNull(),
    themeId: text('theme_id').notNull(),
    title: text('title'),
    shareGuilds: integer('share_guilds', { mode: 'boolean' })
      .default(true)
      .notNull() /** Share with all guilds you are in */,
    shareGlobally: integer('share_globally', { mode: 'boolean' })
      .default(false)
      .notNull() /** Share globally with all users */,
    description: text('description'),
    createdAt: integer('created_at')
      .notNull()
      .$default(() => new Date().getTime()),
  },
  (table) => [index('theme_id').on(table.themeId)],
)

export const jamSubmissionAttachmentsTable = sqliteTable('jam_submission_attachments', {
  id: text('id')
    .primaryKey()
    .$default(() => crypto.randomUUID())
    .notNull(),
  submissionId: text('submission_id').notNull(),
  name: text('name').notNull(),
  url: text('file_url').notNull(),
  contentType: text('content_type').notNull(),
  googleDriveFileId: text('google_drive_file_id'),
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

export const guildJamRelations = relations(guildJamsTable, ({ one }) => ({
  jam: one(jamsTable, {
    fields: [guildJamsTable.jamId],
    references: [jamsTable.id],
  }),
}))
