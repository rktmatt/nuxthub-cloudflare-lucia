// functions are available in server/utils/authFunctions
// validation is made with zod, refer to server/utils/zodValidations
export default defineEventHandler(async (event) => {
  try {
    const {
      challengeId,
      email,
      encodedClientData,
      encodedAuthenticator,
      encodedPublicKey,
      publicKeyId,
      alg,
    } = await readValidatedBody(
      event,
      passKeyregistrationSchema.parse
    )

    // Get the challenge from DB
    const challengeArrayBuffer = await getChallengeFromDB(
      challengeId
    )

    // Validate attestation response
    await validateAttestationResponse(
      event,
      encodedClientData,
      encodedAuthenticator,
      challengeArrayBuffer
    )

    // Save user data and create session
    const user = await saveUserDataAndCreateSession(
      event,
      encodedPublicKey,
      email,
      publicKeyId,
      alg
    )
    return user
  } catch (error) {
    throw error
  }
})
