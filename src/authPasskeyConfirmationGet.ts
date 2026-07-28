import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { PasskeyConfirmationResponse } from "./authTypes.js"
import { authResolveSession } from "./authTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const authPasskeyConfirmationGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type AuthPasskeyConfirmationGetOptions = {
  config: WahaClientConfig
  session?: string
}

export async function authPasskeyConfirmationGet(
  options: AuthPasskeyConfirmationGetOptions,
): PromiseResult<PasskeyConfirmationResponse> {
  const op = "authPasskeyConfirmationGet"
  const parsed = a.safeParse(authPasskeyConfirmationGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = authResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<PasskeyConfirmationResponse>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/auth/passkey/confirmation"),
  })
}
