import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { GroupInfo } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupJoinInfoGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  code: a.string(),
})

export type GroupJoinInfoGetOptions = {
  config: WahaClientConfig
  session?: string
  code: string
}

export async function groupJoinInfoGet(options: GroupJoinInfoGetOptions): PromiseResult<GroupInfo> {
  const op = "groupJoinInfoGet"
  const parsed = a.safeParse(groupJoinInfoGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, code } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<GroupInfo>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/groups/join-info"),
    query: { code },
  })
}
