CREATE TABLE `publicKey` (
	`id` text PRIMARY KEY NOT NULL,
	`publicKey` blob NOT NULL,
	`alg` integer NOT NULL,
	`user_id` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `publicKey`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `alg`;