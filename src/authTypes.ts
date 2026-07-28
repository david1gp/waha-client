import { createResult, createResultError, type Result } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"

export type QrCodeFormat = "image" | "raw"

export type QrCodeValue = {
  value: string
}

export type AuthCodeRequestBody = {
  phoneNumber: string
  method?: string
  localeLanguage?: string
  localeCountry?: string
}

export type PasskeyAssertionResponseData = {
  clientDataJSON: string
  authenticatorData: string
  signature: string
  userHandle?: string
}

export type PasskeyAssertionRequest = {
  id: string
  rawId: string
  type: string
  response: PasskeyAssertionResponseData
}

export type PasskeyAllowedCredential = {
  id: string
  type: string
  transports?: string[]
}

export type PasskeyChallenge = {
  challenge: string
  timeout: number
  rpId: string
  allowCredentials: PasskeyAllowedCredential[]
  userVerification: string
  extensions?: Record<string, unknown>
}

export type PasskeyConfirmationResponse = {
  code: string
}

/** Resolve session from options: `session ?? config.session`. */
export function authResolveSession(op: string, config: WahaClientConfig, session: string | undefined): Result<string> {
  const resolved = session ?? config.session
  if (resolved == null || resolved === "") {
    return createResultError(op, "session is required (pass session or set config.session)")
  }
  return createResult(resolved)
}
