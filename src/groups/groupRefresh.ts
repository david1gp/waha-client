import type { GroupRefreshOptions } from "./groupRefreshOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { GroupRefreshResponse } from "./groupRefreshResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupRefreshOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function groupRefresh(options: GroupRefreshOptions): PromiseResult<GroupRefreshResponse> {
  const op = "groupRefresh"
  const parsed = a.safeParse(groupRefreshOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<GroupRefreshResponse>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/groups/refresh"),
  })
}
