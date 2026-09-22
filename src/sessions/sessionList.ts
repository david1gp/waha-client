import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SessionListOptions } from "./sessionListOptionsSchema.js"
import { sessionListOptionsSchema } from "./sessionListOptionsSchema.js"
import type { SessionInfo } from "./sessionInfo.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

export async function sessionList(options: SessionListOptions): PromiseResult<SessionInfo[]> {
  const op = "sessionList"
  const parsed = a.safeParse(sessionListOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
  }
  const { config, all, expand } = parsed.output
  return wahaRequest<SessionInfo[]>({
    config,
    method: "GET",
    path: wahaPathApi("/sessions"),
    query: {
      all,
      expand: expand?.[0],
    },
  })
}
