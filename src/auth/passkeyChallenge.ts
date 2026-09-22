import type { PasskeyAllowedCredential } from "./passkeyAllowedCredential.js"

export type PasskeyChallenge = {
  challenge: string
  timeout: number
  rpId: string
  allowCredentials: PasskeyAllowedCredential[]
  userVerification: string
  extensions?: Record<string, unknown>
}
