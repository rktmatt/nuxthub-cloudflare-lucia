import { drizzle } from "drizzle-orm/d1";
export { sql, eq, and, or } from "drizzle-orm";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";

import * as schema from "../database/schema";

export const tables = schema;

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema });
}

const adapter = new DrizzleSQLiteAdapter(
  useDrizzle(),
  tables.session,
  tables.user,
);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !process.dev,
    },
  },
});

export type User = typeof schema.user.$inferSelect;
export type Challenge = typeof schema.challenge.$inferSelect;
export type Session = typeof schema.session.$inferSelect;
