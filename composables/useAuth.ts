export async function usePassKeyRegistration(
  accountName: string
): Promise<void> {
  try {
    const { challenge, id } = await $fetch('/api/challenge', {
      method: 'GET',
    })

    const publicKeyCredential =
      await navigator.credentials.create({
        publicKey: {
          rp: { name: 'test-app' },
          user: {
            id: crypto.getRandomValues(new Uint8Array(32)),
            name: accountName,
            displayName: accountName,
          },
          pubKeyCredParams: [
            {
              type: 'public-key',
              alg: -7, // ECDSA with SHA-256(ES256)
            },
            {
              type: 'public-key',
              alg: -257, // RS256
            },
          ],
          challenge: new Uint8Array(challenge),
        },
      })

    const response: AuthenticatorAttestationResponse = (
      publicKeyCredential as any
    ).response
    const clientDataJSON = response.clientDataJSON
    const authenticatorData = response.getAuthenticatorData()
    const publicKey = response.getPublicKey()
    const alg = response.getPublicKeyAlgorithm()

    const encodedClientData = base64.encode(
      new Uint8Array(clientDataJSON)
    )
    const encodedAuthenticatorData = base64.encode(
      new Uint8Array(authenticatorData)
    )
    const encodedPublicKey = base64.encode(
      new Uint8Array(publicKey!)
    )

    const user = await $fetch('/api/auth/createNewUser', {
      method: 'POST',
      body: {
        challengeId: id,
        email: accountName, // I chose email in my example
        encodedClientData: encodedClientData,
        encodedAuthenticator: encodedAuthenticatorData,
        encodedPublicKey: encodedPublicKey,
        publicKeyId: publicKeyCredential!.id,
        alg: alg,
      },
    })
    useState('user', () => user)
  } catch (error) {
    throw error
  }
}

export async function usePassKeyLogin(): Promise<void> {
  try {
    const { challenge, id } = await $fetch('/api/challenge', {
      method: 'GET',
    })

    const publicKeyCredential = await navigator.credentials.get({
      publicKey: { challenge: new Uint8Array(challenge) },
    })

    const response: AuthenticatorAssertionResponse = (
      publicKeyCredential as any
    ).response
    const clientDataJSON: ArrayBuffer = response.clientDataJSON
    const authenticatorData: ArrayBuffer =
      response.authenticatorData
    const signature: ArrayBuffer = response.signature
    const publicKeyId: string = publicKeyCredential!.id

    const encodedClientData = base64.encode(
      new Uint8Array(clientDataJSON)
    )
    const encodedAuthenticatorData = base64.encode(
      new Uint8Array(authenticatorData)
    )
    const encodedSignature = base64.encode(
      new Uint8Array(signature)
    )

    const user = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        challengeId: id,
        publicKeyId: publicKeyId,
        encodedClientData: encodedClientData,
        encodedAuthenticator: encodedAuthenticatorData,
        encodedSignature: encodedSignature,
      },
    })

    useState('user', () => user)
  } catch (error) {
    throw error
  }
}

export const useLogout = async () => {
  // no need to try catch $fetch errors.
  await $fetch('/api/auth/logout', { method: 'POST' })
  clearNuxtState('user')
  navigateTo('/')
}
