import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { authResolveSession } from "./authTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const authPasskeyConfirmOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type AuthPasskeyConfirmOptions = {
  config: WahaClientConfig
  session?: string
}

export async function authPasskeyConfirm(options: AuthPasskeyConfirmOptions): PromiseResult<unknown> {
  const op = "authPasskeyConfirm"
  const parsed = a.safeParse(authPasskeyConfirmOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = authResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/auth/passkey/confirm"),
  })
}
