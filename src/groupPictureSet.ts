import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaFile, WahaResult } from "./profileTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

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

const groupPictureSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  file: wahaFileSchema,
})

export type GroupPictureSetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  file: WahaFile
}

export async function groupPictureSet(options: GroupPictureSetOptions): PromiseResult<WahaResult> {
  const op = "groupPictureSet"
  const parsed = a.safeParse(groupPictureSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id, file } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WahaResult>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/picture`),
    body: { file },
  })
}
