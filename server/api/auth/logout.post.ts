export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user?.id) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Already logged out',
    })
  }
  await initializeLucia(hubDatabase()).invalidateUserSessions(
    user.id
  )
})
