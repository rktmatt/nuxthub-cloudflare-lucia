import { describe, expect, test, vi } from 'vitest'
import {
  generateChallenge,
  initializeOsloController,
} from './authFunctions'
import { WebAuthnController } from 'oslo/webauthn'
import type { H3Event, EventHandlerRequest } from 'h3'

describe('generateChallenge', () => {
  test('returns an ArrayBuffer of the correct length', () => {
    const challenge = generateChallenge()
    expect(challenge).toBeInstanceOf(ArrayBuffer)
    expect(challenge.byteLength).toBe(32) // Assuming 32 bytes are generated
  })

  test('throws an error if generating random bytes fails', () => {
    // Mocking crypto.getRandomValues to simulate failure
    const originalGetRandomValues = crypto.getRandomValues
    crypto.getRandomValues = vi.fn(() => {
      throw new Error('Mocked error')
    })

    // Test if generateChallenge throws an error
    expect(() => generateChallenge()).toThrow()

    // Restore original getRandomValues function
    crypto.getRandomValues = originalGetRandomValues
  })
})
