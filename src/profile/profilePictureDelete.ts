import type { ProfilePictureDeleteOptions } from "./profilePictureDeleteOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaResult } from "../client/wahaResult.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const profilePictureDeleteOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function profilePictureDelete(options: ProfilePictureDeleteOptions): PromiseResult<WahaResult> {
  const op = "profilePictureDelete"
  const parsed = a.safeParse(profilePictureDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WahaResult>({
    config,
    method: "DELETE",
    path: wahaPathSession(sessionR.data, "/profile/picture"),
  })
}
