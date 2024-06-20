import { verifyRequestOrigin } from 'lucia'
import type { Session, User } from 'lucia'

export default defineEventHandler(async (event) => {
  if (event.method !== 'GET') {
    const originHeader = getHeader(event, 'Origin') ?? null
    const hostHeader = getHeader(event, 'Host') ?? null
    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      throw createError({ statusCode: 403 })
    }
  }

  const sessionId =
    getCookie(
      event,
      initializeLucia(hubDatabase()).sessionCookieName
    ) ?? null
  if (!sessionId) {
    event.context.session = null
    event.context.user = null
    return
  }

  const { session, user } = await initializeLucia(
    hubDatabase()
  ).validateSession(sessionId)
  if (session && session.fresh) {
    appendResponseHeader(
      event,
      'Set-Cookie',
      initializeLucia(hubDatabase())
        .createSessionCookie(session.id)
        .serialize()
    )
  }
  if (!session) {
    appendResponseHeader(
      event,
      'Set-Cookie',
      initializeLucia(hubDatabase())
        .createBlankSessionCookie()
        .serialize()
    )
  }
  event.context.session = session
  event.context.user = user
})

declare module 'h3' {
  interface H3EventContext {
    user: User | null
    session: Session | null
  }
}
