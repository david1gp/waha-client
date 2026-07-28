import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { type SessionListOptions, sessionListOptionsSchema } from "./sessionSchemas.js"
import type { SessionInfo } from "./sessionTypes.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

export async function sessionList(options: SessionListOptions): PromiseResult<SessionInfo[]> {
  const op = "sessionList"
  const parsed = a.safeParse(sessionListOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))
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
