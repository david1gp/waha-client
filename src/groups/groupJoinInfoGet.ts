import type { GroupJoinInfoGetOptions } from "./groupJoinInfoGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { groupInfoResponseNormalize } from "./groupInfoResponseNormalize.js"
import type { GroupInfo } from "./groupInfo.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupJoinInfoGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  code: a.string(),
})

export async function groupJoinInfoGet(options: GroupJoinInfoGetOptions): PromiseResult<GroupInfo> {
  const op = "groupJoinInfoGet"
  const parsed = a.safeParse(groupJoinInfoGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, code } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const responseR = await wahaRequest<unknown>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/groups/join-info"),
    query: { code },
  })
  if (!responseR.success) return responseR
  return groupInfoResponseNormalize(responseR.data, op)
}
