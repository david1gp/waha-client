import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { AuthCodeRequestBody } from "./authTypes.js"
import { authResolveSession } from "./authTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const authCodeRequestOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  phoneNumber: a.pipe(a.string(), a.minLength(1)),
  method: a.optional(a.string()),
  localeLanguage: a.optional(a.string()),
  localeCountry: a.optional(a.string()),
})

export type AuthCodeRequestOptions = {
  config: WahaClientConfig
  session?: string
  phoneNumber: string
  method?: string
  localeLanguage?: string
  localeCountry?: string
}

export async function authCodeRequest(options: AuthCodeRequestOptions): PromiseResult<unknown> {
  const op = "authCodeRequest"
  const parsed = a.safeParse(authCodeRequestOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, phoneNumber, method, localeLanguage, localeCountry } = parsed.output
  const sessionR = authResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: AuthCodeRequestBody = { phoneNumber }
  if (method !== undefined) body.method = method
  if (localeLanguage !== undefined) body.localeLanguage = localeLanguage
  if (localeCountry !== undefined) body.localeCountry = localeCountry

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/auth/request-code"),
    body,
  })
}
