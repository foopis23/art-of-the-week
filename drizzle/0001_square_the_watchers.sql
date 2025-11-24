CREATE TABLE `guild_jams` (
	`id` text PRIMARY KEY NOT NULL,
	`guild_id` text NOT NULL,
	`jam_id` text NOT NULL,
	`message_id` text,
	`message_link` text,
	`theme_submission_folder_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `guild_id_jam_id` ON `guild_jams` (`guild_id`,`jam_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `message_id` ON `guild_jams` (`message_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `guildid_jamid` ON `guild_jams` (`guild_id`,`jam_id`);--> statement-breakpoint
-- Migrate existing jams data to guild_jams table
-- This preserves guild-specific jam information (message_id, message_link, etc.)
-- Using INSERT OR IGNORE to handle re-runs gracefully (conflicts on unique (guild_id, jam_id))
INSERT OR IGNORE INTO `guild_jams` (`id`, `guild_id`, `jam_id`, `message_id`, `message_link`, `theme_submission_folder_id`, `created_at`)
SELECT 
	lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))) as `id`,
	`guild_id`,
	`id` as `jam_id`,
	`message_id`,
	`message_link`,
	`theme_submission_folder_id`,
	`created_at`
FROM `jams`
WHERE `guild_id` IS NOT NULL;--> statement-breakpoint
CREATE TABLE `jam_submission_attachment_guild_files` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_attachment_id` text NOT NULL,
	`guild_id` text NOT NULL,
	`google_drive_file_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `submission_attachment_id` ON `jam_submission_attachment_guild_files` (`submission_attachment_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `guild_id` ON `jam_submission_attachment_guild_files` (`guild_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `attachment_guild` ON `jam_submission_attachment_guild_files` (`submission_attachment_id`,`guild_id`);--> statement-breakpoint
DROP INDEX IF EXISTS `guild_id_user_id`;--> statement-breakpoint
ALTER TABLE `jam_submissions` ADD `share_guilds` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `jam_submissions` ADD `share_globally` integer DEFAULT false NOT NULL;--> statement-breakpoint
-- Migrate existing google_drive_file_id from jam_submission_attachments to jam_submission_attachment_guild_files
-- This preserves the guild-specific Google Drive file mappings
-- Using INSERT OR IGNORE to handle re-runs gracefully (conflicts on unique (submission_attachment_id, guild_id))
INSERT OR IGNORE INTO `jam_submission_attachment_guild_files` (`id`, `submission_attachment_id`, `guild_id`, `google_drive_file_id`, `created_at`)
SELECT 
	lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', (abs(random()) % 4) + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))) as `id`,
	jsa.`id` as `submission_attachment_id`,
	js.`guild_id`,
	jsa.`google_drive_file_id`,
	jsa.`created_at`
FROM `jam_submission_attachments` jsa
INNER JOIN `jam_submissions` js ON jsa.`submission_id` = js.`id`
WHERE jsa.`google_drive_file_id` IS NOT NULL 
	AND js.`guild_id` IS NOT NULL;--> statement-breakpoint
ALTER TABLE `jam_submissions` DROP COLUMN `guild_id`;--> statement-breakpoint
DROP INDEX IF EXISTS `message_id`;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `theme_deadline` ON `jams` (`theme`,`deadline`);--> statement-breakpoint
ALTER TABLE `jams` DROP COLUMN `guild_id`;--> statement-breakpoint
ALTER TABLE `jams` DROP COLUMN `message_id`;--> statement-breakpoint
ALTER TABLE `jams` DROP COLUMN `message_link`;--> statement-breakpoint
ALTER TABLE `jams` DROP COLUMN `theme_submission_folder_id`;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `theme_pool_theme_unique` ON `theme_pool` (`theme`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `theme` ON `theme_pool` (`theme`);--> statement-breakpoint
ALTER TABLE `theme_pool` DROP COLUMN `guild_id`;--> statement-breakpoint
ALTER TABLE `settings` DROP COLUMN `theme_announcement_day`;