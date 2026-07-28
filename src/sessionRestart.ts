import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { type SessionPathOptions, sessionPathOptionsSchema, sessionResolveName } from "./sessionSchemas.js"
import type { SessionDTO } from "./sessionTypes.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

export async function sessionRestart(options: SessionPathOptions): PromiseResult<SessionDTO> {
  const op = "sessionRestart"
  const parsed = a.safeParse(sessionPathOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))
  }
  const { config } = parsed.output
  const session = sessionResolveName(parsed.output.session, config.session)
  if (!session) {
    return createResultError(op, "session is required (options.session or config.session)")
  }
  return wahaRequest<SessionDTO>({
    config,
    method: "POST",
    path: wahaPathApi(`/sessions/${encodeURIComponent(session)}/restart`),
  })
}
