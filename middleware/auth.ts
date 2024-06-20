export default defineNuxtRouteMiddleware(async () => {
  const user = useState('user')
  const session = useState('session')
  if (!user || !session) return navigateTo('/')
})
