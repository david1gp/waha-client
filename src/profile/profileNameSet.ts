import type { ProfileNameSetOptions } from "./profileNameSetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaResult } from "../client/wahaResult.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const profileNameSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  name: a.pipe(a.string(), a.minLength(1)),
})

export async function profileNameSet(options: ProfileNameSetOptions): PromiseResult<WahaResult> {
  const op = "profileNameSet"
  const parsed = a.safeParse(profileNameSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
