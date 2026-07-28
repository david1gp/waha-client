import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { type SessionUpdateOptions, sessionResolveName, sessionUpdateOptionsSchema } from "./sessionSchemas.js"
import type { SessionDTO } from "./sessionTypes.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

export async function sessionUpdate(options: SessionUpdateOptions): PromiseResult<SessionDTO> {
  const op = "sessionUpdate"
  const parsed = a.safeParse(sessionUpdateOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))
  }
  const { config, sessionConfig, apps } = parsed.output
  const session = sessionResolveName(parsed.output.session, config.session)
  if (!session) {
    return createResultError(op, "session is required (options.session or config.session)")
  }
  return wahaRequest<SessionDTO>({
    config,
    method: "PUT",
    path: wahaPathApi(`/sessions/${encodeURIComponent(session)}`),
    body: {
      ...(sessionConfig !== undefined ? { config: sessionConfig } : {}),
      ...(apps !== undefined ? { apps } : {}),
    },
  })
}
