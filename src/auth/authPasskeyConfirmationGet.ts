import type { AuthPasskeyConfirmationGetOptions } from "./authPasskeyConfirmationGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { PasskeyConfirmationResponse } from "./passkeyConfirmationResponse.js"
import { authResolveSession } from "./authResolveSession.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"

const authPasskeyConfirmationGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function authPasskeyConfirmationGet(
  options: AuthPasskeyConfirmationGetOptions,
): PromiseResult<PasskeyConfirmationResponse> {
  const op = "authPasskeyConfirmationGet"
  const parsed = a.safeParse(authPasskeyConfirmationGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = authResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<PasskeyConfirmationResponse>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/auth/passkey/confirmation"),
  })
}
