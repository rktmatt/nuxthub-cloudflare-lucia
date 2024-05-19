export default defineNuxtRouteMiddleware(async () => {
  const { user, session } = await $fetch('/api/me', {
    method: 'GET',
  })

  if (!user || !session) return navigateTo('/')
})
