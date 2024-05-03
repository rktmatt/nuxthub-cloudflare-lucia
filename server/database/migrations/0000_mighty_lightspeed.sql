CREATE TABLE `challenge` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`challenge` blob NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expiresAt` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`lastName` text,
	`firstName` text,
	`email` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`role` text DEFAULT 'user'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);