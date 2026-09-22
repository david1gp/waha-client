import type { GroupJoinOptions } from "./groupJoinOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { GroupJoinResponse } from "./groupJoinResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupJoinOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  code: a.string(),
})

export async function groupJoin(options: GroupJoinOptions): PromiseResult<GroupJoinResponse> {
  const op = "groupJoin"
  const parsed = a.safeParse(groupJoinOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, code } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<GroupJoinResponse>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/groups/join"),
    body: { code },
  })
}
