import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { GroupRefreshResponse } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupRefreshOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export type GroupRefreshOptions = {
  config: WahaClientConfig
  session?: string
}

export async function groupRefresh(options: GroupRefreshOptions): PromiseResult<GroupRefreshResponse> {
  const op = "groupRefresh"
  const parsed = a.safeParse(groupRefreshOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<GroupRefreshResponse>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/groups/refresh"),
  })
}
