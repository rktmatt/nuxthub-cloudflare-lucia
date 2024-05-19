export default defineEventHandler(async () => {
  const generatedChallenge = generateChallenge()

  const challenge = await useDrizzle()
    .insert(tables.challenge)
    .values({
      challenge: generatedChallenge,
    })
    .returning()
    .get()

  return challenge
})
