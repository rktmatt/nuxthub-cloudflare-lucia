// functions are available in server/utils/authFunctions
// validation is made with zod, refer to server/utils/zodValidations
export default defineEventHandler(async (event) => {
  try {
    const {
      challengeId,
      publicKeyId,
      encodedClientData,
      encodedAuthenticator,
      encodedSignature,
    } = await readValidatedBody(event, passKeyLoginSchema.parse)

    // Get the challenge from DB
    const challengeArrayBuffer = await getChallengeFromDB(
      challengeId
    )

    // Validate assertion response
    const user = await validateAssertionResponse(
      event,
      challengeArrayBuffer,
      encodedClientData,
      encodedAuthenticator,
      encodedSignature,
      publicKeyId
    )

    // Save user data and create session
    await createSession(event, user.id)

    return user
  } catch (error) {
    throw error
  }
})
