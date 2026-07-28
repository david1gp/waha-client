import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaResult } from "./profileTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const profileNameSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  name: a.pipe(a.string(), a.minLength(1)),
})

export type ProfileNameSetOptions = {
  config: WahaClientConfig
  session?: string
  name: string
}

export async function profileNameSet(options: ProfileNameSetOptions): PromiseResult<WahaResult> {
  const op = "profileNameSet"
  const parsed = a.safeParse(profileNameSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, name } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WahaResult>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, "/profile/name"),
    body: { name },
  })
}
