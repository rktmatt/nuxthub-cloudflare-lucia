import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export type UserId = string & { __brand: "userId" };

/**
 * Session table
 */
export const session = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  expiresAt: integer("expiresAt").notNull(),
});

/**
 * Challenge table
 */
export const challenge = sqliteTable("challenge", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  challenge: blob("challenge").notNull(),
  //userId: text("userId")
  //  .notNull()
  //  .references(() => user.id),
});

/**
 * This represent users using the app
 */
export const user = sqliteTable("user", {
  id: text("id").$type<UserId>().primaryKey(),
  lastName: text("lastName"),
  firstName: text("firstName"),
  email: text("email").notNull().unique(),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  role: text("role", { enum: ["user", "admin"] }).default("user"),
});