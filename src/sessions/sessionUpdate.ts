import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SessionUpdateOptions } from "./sessionUpdateOptionsSchema.js"
import { sessionResolveName } from "./sessionResolveName.js"
import { sessionUpdateOptionsSchema } from "./sessionUpdateOptionsSchema.js"
import type { SessionDTO } from "./sessionDTO.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

export async function sessionUpdate(options: SessionUpdateOptions): PromiseResult<SessionDTO> {
  const op = "sessionUpdate"
  const parsed = a.safeParse(sessionUpdateOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
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
