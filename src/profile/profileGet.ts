import type { ProfileGetOptions } from "./profileGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { MyProfile } from "./myProfile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const profileGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function profileGet(options: ProfileGetOptions): PromiseResult<MyProfile> {
  const op = "profileGet"
  const parsed = a.safeParse(profileGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<MyProfile>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/profile"),
  })
}
