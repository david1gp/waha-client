import type { ProfilePictureSetOptions } from "./profilePictureSetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaFile } from "../media/wahaFile.js"
import type { WahaResult } from "../client/wahaResult.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const wahaFileSchema = a.union([
  a.object({
    mimetype: a.string(),
    filename: a.optional(a.string()),
    url: a.string(),
  }),
  a.object({
    mimetype: a.string(),
    filename: a.optional(a.string()),
    data: a.string(),
  }),
])

const profilePictureSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  file: wahaFileSchema,
})

export async function profilePictureSet(options: ProfilePictureSetOptions): PromiseResult<WahaResult> {
  const op = "profilePictureSet"
  const parsed = a.safeParse(profilePictureSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, file } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WahaResult>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, "/profile/picture"),
    body: { file },
  })
}
