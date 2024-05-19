import { z } from 'zod'

export const passKeyregistrationSchema = z.object({
  challengeId: z.number(),
  email: z.string().email(), // you can select another kind
  encodedClientData: z.string(),
  encodedAuthenticator: z.string(),
  encodedPublicKey: z.string(),
  publicKeyId: z.string(),
  alg: z.number(),
})

export const passKeyLoginSchema = z.object({
  challengeId: z.number(),
  publicKeyId: z.string(),
  encodedClientData: z.string(),
  encodedAuthenticator: z.string(),
  encodedSignature: z.string(),
})
