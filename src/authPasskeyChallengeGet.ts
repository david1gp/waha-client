import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { PasskeyChallenge } from "./authTypes.js"
import { authResolveSession } from "./authTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const authPasskeyChallengeGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type AuthPasskeyChallengeGetOptions = {
  config: WahaClientConfig
  session?: string
}

export async function authPasskeyChallengeGet(
  options: AuthPasskeyChallengeGetOptions,
): PromiseResult<PasskeyChallenge> {
  const op = "authPasskeyChallengeGet"
  const parsed = a.safeParse(authPasskeyChallengeGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = authResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<PasskeyChallenge>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/auth/passkey/challenge"),
  })
}
