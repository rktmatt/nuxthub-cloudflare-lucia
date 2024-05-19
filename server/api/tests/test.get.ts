export default defineEventHandler(async () => {
  const users = await useDrizzle().select().from(tables.user)
  const sessions = await useDrizzle()
    .select()
    .from(tables.session)
  const keys = await useDrizzle().select().from(tables.publicKey)

  const res = {
    users: users,
    sessions: sessions,
    keys: keys,
  }
  return res
})
