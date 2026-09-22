import type { AuthPasskeyPostOptions } from "./authPasskeyPostOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { PasskeyAssertionRequest } from "./passkeyAssertionRequest.js"
import { authResolveSession } from "./authResolveSession.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"

const passkeyAssertionResponseSchema = a.object({
  clientDataJSON: a.string(),
  authenticatorData: a.string(),
  signature: a.string(),
  userHandle: a.optional(a.string()),
})

const authPasskeyPostOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.pipe(a.string(), a.minLength(1)),
  rawId: a.pipe(a.string(), a.minLength(1)),
  type: a.pipe(a.string(), a.minLength(1)),
  response: passkeyAssertionResponseSchema,
})

export async function authPasskeyPost(options: AuthPasskeyPostOptions): PromiseResult<unknown> {
  const op = "authPasskeyPost"
  const parsed = a.safeParse(authPasskeyPostOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id, rawId, type, response } = parsed.output
  const sessionR = authResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: PasskeyAssertionRequest = { id, rawId, type, response }

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/auth/passkey"),
    body,
  })
}
