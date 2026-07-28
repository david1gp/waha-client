import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaResult } from "./profileTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupPictureDeleteOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

export type GroupPictureDeleteOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}

export async function groupPictureDelete(options: GroupPictureDeleteOptions): PromiseResult<WahaResult> {
  const op = "groupPictureDelete"
  const parsed = a.safeParse(groupPictureDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WahaResult>({
    config,
    method: "DELETE",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/picture`),
  })
}
