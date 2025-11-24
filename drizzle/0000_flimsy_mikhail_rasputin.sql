CREATE TABLE IF NOT EXISTS `jam_submission_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`name` text NOT NULL,
	`file_url` text NOT NULL,
	`content_type` text NOT NULL,
	`google_drive_file_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `jam_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`guild_id` text NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`theme_id` text NOT NULL,
	`title` text,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `guild_id_user_id` ON `jam_submissions` (`guild_id`,`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `theme_id` ON `jam_submissions` (`theme_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `jams` (
	`id` text PRIMARY KEY NOT NULL,
	`guild_id` text NOT NULL,
	`theme` text NOT NULL,
	`message_id` text NOT NULL,
	`message_link` text NOT NULL,
	`deadline` integer NOT NULL,
	`theme_submission_folder_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `message_id` ON `jams` (`message_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `settings` (
	`guild_id` text PRIMARY KEY NOT NULL,
	`theme_announcement_channel_id` text,
	`theme_announcement_day` text DEFAULT 'MON',
	`google_drive_folder_url` text,
	`google_drive_enabled` integer DEFAULT false NOT NULL,
	`streaks_mode` text DEFAULT 'disabled' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `theme_pool` (
	`id` text PRIMARY KEY NOT NULL,
	`guild_id` text NOT NULL,
	`theme` text NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL
);
