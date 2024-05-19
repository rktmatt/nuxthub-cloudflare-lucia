import { Base64Encoding } from 'oslo/encoding'
import { WebAuthnController } from 'oslo/webauthn'
import { uuidv7 } from 'uuidv7'
import type { H3Event, EventHandlerRequest } from 'h3'

export const base64 = new Base64Encoding(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
)

/**
 * Generates a random challenge as an ArrayBuffer.
 *
 * @returns {ArrayBuffer} A randomly generated challenge.
 * @throws {Error} If generating the random bytes fails.
 */
export function generateChallenge(): ArrayBuffer {
  try {
    // Generate a random array of bytes
    const randomBytes = new Uint8Array(32) // 32 bytes = 256 bits
    crypto.getRandomValues(randomBytes)

    // Convert Uint8Array to ArrayBuffer
    return randomBytes.buffer
  } catch (error: any) {
    // Log the error if generating random bytes fails
    console.error('Error generating challenge:', error.message)

    // Throw an error indicating failure to generate the challenge
    throw createError({
      statusCode: 500,
      statusMessage: 'Error generating challenge.',
      stack: error.message,
    })
  }
}

/**
 * Initializes the Oslo controller for WebAuthn operations.
 *
 * @param {H3Event<EventHandlerRequest>} event The event object containing information about the request.
 * @returns {WebAuthnController} The initialized WebAuthnController instance.
 */
export function initializeOsloController(
  event: H3Event<EventHandlerRequest>
): WebAuthnController {
  // Get the request URL from the event
  const url = getRequestURL(event)

  // Initialize the WebAuthnController with the URL
  const webAuthnController = new WebAuthnController(
    url.toString()
  )

  // Return the initialized WebAuthnController instance
  return webAuthnController
}

/**
 * Retrieves a challenge from the database and deletes it.
 *
 * @param {number} challengeId The ID of the challenge to retrieve.
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the retrieved challenge as an ArrayBuffer.
 */
export async function getChallengeFromDB(
  challengeId: number
): Promise<ArrayBuffer> {
  try {
    // Get the challenge from the database and delete it
    const getChallenge = await useDrizzle()
      .delete(tables.challenge)
      .where(eq(tables.challenge.id, challengeId))
      .returning()
      .get()

    // Check if a challenge was retrieved
    if (!getChallenge) {
      throw createError({
        statusCode: 404,
        statusMessage:
          'No challenge found with ID: ' + challengeId,
      })
    }

    // Extract the challenge as an ArrayBuffer
    const arrayBuffer = getChallenge.challenge as ArrayBuffer
    return arrayBuffer
  } catch (error) {
    if (error instanceof Error) {
      console.error('Database error:', error.message)
      throw createError({
        statusCode: 500,
        statusMessage:
          'Failed to retrieve challenge from the database',
      })
    }
    throw error
  }
}

/**
 * Validates the attestation response received from the client.
 * This method verifies the authenticity of the attestation response by performing the following checks:
 * - Decodes the client data JSON and authenticator data from base64-encoded strings.
 * - Compares the challenge saved in the database to the challenge provided by the client data JSON.
 * - Verifies the authenticator data by comparing buffers.
 *
 * @param {WebAuthnController} webAuthnController The WebAuthnController instance used for validation.
 * @param {string} encodedClientData The base64-encoded client data JSON.
 * @param {string} encodedAuthenticator The base64-encoded authenticator data.
 * @param {ArrayBuffer} challengeArrayBuffer The challenge saved in the database, provided as an ArrayBuffer.
 * @returns {Promise<void>} A promise that resolves once the attestation response is successfully validated.
 */
export async function validateAttestationResponse(
  event: H3Event<EventHandlerRequest>,
  encodedClientData: string,
  encodedAuthenticator: string,
  challengeArrayBuffer: ArrayBuffer
): Promise<void> {
  try {
    // Decode base64-encoded client data JSON and authenticator data
    const clientDataJSON = base64.decode(encodedClientData)
    const authenticatorData = base64.decode(encodedAuthenticator)

    // Construct attestation response object
    const attestationResponse = {
      clientDataJSON: clientDataJSON,
      authenticatorData: authenticatorData,
    }

    const webAuthnController = initializeOsloController(event)
    // Validate attestation response using the WebAuthnController
    await webAuthnController.validateAttestationResponse(
      attestationResponse,
      challengeArrayBuffer
    )
  } catch (error: any) {
    console.error(
      'Error validating attestation response:',
      error.message
    )
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to validate attestation response',
    })
  }
}

/**
 * Saves user data including public key and creates a session for the user.
 *
 * @param {H3Event<EventHandlerRequest>} event The event object containing information about the request.
 * @param {string} encodedPublicKey The base64-encoded public key of the user.
 * @param {string} email The email address of the user.
 * @param {number} alg The algorithm number associated with the public key.
 * @returns {Promise<void>} A promise that resolves once the user data is successfully saved and the session is created.
 */
export async function saveUserDataAndCreateSession(
  event: H3Event<EventHandlerRequest>,
  encodedPublicKey: string,
  email: string,
  publicKeyId: string,
  alg: number
): Promise<User> {
  try {
    // Generate a unique user ID
    const userId = ('user_' + uuidv7()) as User['id']

    const batch = await useDrizzle().batch([
      useDrizzle()
        .insert(tables.user)
        .values({ id: userId, email: email })
        .returning(),
      useDrizzle().insert(tables.publicKey).values({
        id: publicKeyId,
        publicKey: encodedPublicKey,
        alg: alg,
        userId: userId,
      }),
    ])

    // Create a session for the user
    await createSession(event, userId)

    return batch[0][0]
  } catch (error: any) {
    if (
      error.message.includes(
        'UNIQUE constraint failed: user.email'
      )
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: 'The provided email is already in use.',
      })
    } else {
      throw error
    }
  }
}

/**
 * Creates a session for the user.
 *
 * @param {H3Event<EventHandlerRequest>} event The event object containing information about the request.
 * @param {User} user defined in the schema
 * @returns {Promise<void>} A promise that resolves once the user data is successfully saved and the session is created.
 */
export async function createSession(
  event: H3Event<EventHandlerRequest>,
  userId: User['id']
): Promise<void> {
  try {
    const session = await initializeLucia(
      hubDatabase()
    ).createSession(userId, {})

    if (!session) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to initialize a session',
      })
    }

    // Append session cookie to the response header
    appendHeader(
      event,
      'Set-Cookie',
      initializeLucia(hubDatabase())
        .createSessionCookie(session.id)
        .serialize()
    )
  } catch (error: any) {
    console.error('Error :', error.message)
    throw error
  }
}

/**
 * Validates an assertion response for WebAuthn authentication.
 *
 * This function decodes the base64-encoded client data JSON, authenticator data, and signature.
 * It constructs an assertion response object and retrieves the public key and algorithm
 * from the database. Then, it uses the WebAuthnController to validate the assertion response
 * against the provided challenge.
 *
 * @async
 * @function validateAssertionResponse
 * @param {H3Event<EventHandlerRequest>} event - The event object containing the request details.
 * @param {ArrayBuffer} challengeArrayBuffer - The challenge sent to the client.
 * @param {string} encodedClientData - Base64-encoded client data JSON.
 * @param {string} encodedAuthenticator - Base64-encoded authenticator data.
 * @param {string} encodedSignature - Base64-encoded signature.
 * @param {string} publicKeyId - The identifier for the public key stored in the database.
 * @returns {Promise<User['id']>} The user ID associated with the validated assertion response.
 * @throws {Error} Throws an error if the validation fails.
 */
export async function validateAssertionResponse(
  event: H3Event<EventHandlerRequest>,
  challengeArrayBuffer: ArrayBuffer,
  encodedClientData: string,
  encodedAuthenticator: string,
  encodedSignature: string,
  publicKeyId: string
): Promise<User> {
  try {
    // Decode base64-encoded client data JSON, authenticator data and signature
    const clientDataJSON = base64.decode(encodedClientData)
    const authenticatorData = base64.decode(encodedAuthenticator)
    const signature = base64.decode(encodedSignature)

    // Construct assertion response object
    const assertionResponse = {
      clientDataJSON: clientDataJSON,
      authenticatorData: authenticatorData,
      signature: signature,
    }

    // Get publicKey and algorithm from DB
    const { alg, publicKey, user } = await getPublicKeyFromDB(
      publicKeyId
    )

    const webAuthnController = initializeOsloController(event)
    // Validate assertion response using the WebAuthnController
    await webAuthnController.validateAssertionResponse(
      alg,
      publicKey,
      assertionResponse,
      challengeArrayBuffer
    )

    return user as User
  } catch (error: any) {
    throw error
  }
}

/**
 * Retrieves the public key and associated information from the database.
 *
 * @async
 * @function getPublicKeyFromDB
 * @param {string} key - The identifier for the public key in the database.
 * @returns {Promise<{ alg: 'ES256' | 'RS256', publicKey: ArrayBuffer, userId: string }>}
 *          An object containing the algorithm, public key, and user ID.
 * @throws {Error} Throws an error if the key is not found or if the algorithm is unrecognized.
 */
export async function getPublicKeyFromDB(key: string): Promise<{
  alg: 'ES256' | 'RS256'
  publicKey: ArrayBuffer
  user: User
}> {
  const rows = await useDrizzle()
    .select()
    .from(tables.publicKey)
    .where(eq(tables.publicKey.id, key))

  if (!rows.length) {
    throw createError({
      statusCode: 404,
      statusMessage: "Couldn't find the key",
    })
  }

  const userId = rows[0].userId as User['id']

  const user = await useDrizzle()
    .select()
    .from(tables.user)
    .where(eq(tables.user.id, userId))

  let alg: 'ES256' | 'RS256'
  switch (rows[0].alg) {
    case -7:
      alg = 'ES256'
      break
    case -257:
      alg = 'RS256'
      break
    default:
      throw createError({
        statusCode: 500,
        statusMessage: 'Error parsing the publicKey algorithm',
      })
  }

  const publicKey: ArrayBuffer = base64.decode(
    rows[0].publicKey as string
  )

  return {
    alg: alg,
    publicKey: publicKey,
    user: user[0],
  }
}
