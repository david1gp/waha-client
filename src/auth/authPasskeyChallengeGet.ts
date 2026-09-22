import type { AuthPasskeyChallengeGetOptions } from "./authPasskeyChallengeGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { PasskeyChallenge } from "./passkeyChallenge.js"
import { authResolveSession } from "./authResolveSession.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"

const authPasskeyChallengeGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function authPasskeyChallengeGet(
  options: AuthPasskeyChallengeGetOptions,
): PromiseResult<PasskeyChallenge> {
  const op = "authPasskeyChallengeGet"
  const parsed = a.safeParse(authPasskeyChallengeGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = authResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<PasskeyChallenge>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/auth/passkey/challenge"),
  })
}
