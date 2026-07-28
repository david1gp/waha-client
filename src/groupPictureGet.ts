import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ChatPictureResponse } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupPictureGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  refresh: a.optional(a.boolean()),
})

export type GroupPictureGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  refresh?: boolean
}

export async function groupPictureGet(options: GroupPictureGetOptions): PromiseResult<ChatPictureResponse> {
  const op = "groupPictureGet"
  const parsed = a.safeParse(groupPictureGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id, refresh } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ChatPictureResponse>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/picture`),
    query: { refresh },
  })
}
