import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SessionGetOptions } from "./sessionGetOptionsSchema.js"
import { sessionGetOptionsSchema } from "./sessionGetOptionsSchema.js"
import { sessionResolveName } from "./sessionResolveName.js"
import type { SessionInfo } from "./sessionInfo.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

export async function sessionGet(options: SessionGetOptions): PromiseResult<SessionInfo> {
  const op = "sessionGet"
  const parsed = a.safeParse(sessionGetOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
  }
  const { config, expand } = parsed.output
  const session = sessionResolveName(parsed.output.session, config.session)
  if (!session) {
    return createResultError(op, "session is required (options.session or config.session)")
  }
  return wahaRequest<SessionInfo>({
    config,
    method: "GET",
    path: wahaPathApi(`/sessions/${encodeURIComponent(session)}`),
    query: {
      expand: expand?.[0],
    },
  })
}
