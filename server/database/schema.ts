import {
  sqliteTable,
  text,
  integer,
  blob,
} from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export type UserId = string & { __brand: 'userId' }

/**
 * Session table
 */
export const session = sqliteTable('session', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  expiresAt: integer('expires_at', {
    mode: 'timestamp',
  }).notNull(),
})

/**
 * Challenge table
 */
export const challenge = sqliteTable('challenge', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  challenge: blob('challenge').notNull(),
})

/**
 * User table
 */
export const user = sqliteTable('user', {
  id: text('id').$type<UserId>().primaryKey(),
  lastName: text('lastName'),
  firstName: text('firstName'),
  email: text('email').notNull().unique(),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`),
  role: text('role', { enum: ['user', 'admin'] }).default(
    'user'
  ),
})

/**
 * Public Key table
 */
export const publicKey = sqliteTable('publicKey', {
  id: text('id').primaryKey(),
  publicKey: blob('publicKey').notNull(),
  alg: integer('alg').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  createdAt: text('createdAt').default(sql`(CURRENT_TIMESTAMP)`),
})
