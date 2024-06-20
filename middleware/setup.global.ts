export default defineNuxtRouteMiddleware(async () => {
  const { user, session } = await $fetch('/api/me', {
    method: 'GET',
  })
  if (!user || !session) {
    clearNuxtState('user')
    clearNuxtState('session')
    return
  }
  useState('user', () => user as User)
  useState('session', () => ({
    ...session,
    expiresAt: new Date(session.expiresAt),
  }))
})
