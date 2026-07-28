import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { MyProfile } from "./profileTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const profileGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type ProfileGetOptions = {
  config: WahaClientConfig
  session?: string
}

export async function profileGet(options: ProfileGetOptions): PromiseResult<MyProfile> {
  const op = "profileGet"
  const parsed = a.safeParse(profileGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<MyProfile>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/profile"),
  })
}
