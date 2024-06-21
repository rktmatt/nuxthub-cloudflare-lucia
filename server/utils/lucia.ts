import { Lucia } from 'lucia'
import { D1Adapter } from '@lucia-auth/adapter-sqlite'

export function initializeLucia(D1: D1Database) {
  const adapter = new D1Adapter(D1, {
    user: 'user',
    session: 'session',
  })
  return new Lucia(adapter, {
    getUserAttributes: (databaseUser) => {
      return {
        lastName: databaseUser.lastName,
        firstName: databaseUser.firstName,
        email: databaseUser.email,
        role: databaseUser.role,
        createdAt: databaseUser.createdAt,
      }
    },
  })
}

declare module 'lucia' {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

interface DatabaseUserAttributes {
  lastName: string
  firstName: string
  email: string
  role: string
  createdAt: string
}
