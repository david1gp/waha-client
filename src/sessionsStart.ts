import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { type SessionsStartOptions, sessionResolveName, sessionsStartOptionsSchema } from "./sessionSchemas.js"
import type { SessionDTO } from "./sessionTypes.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

/** @deprecated WAHA POST /api/sessions/start — upsert and start */
export async function sessionsStart(options: SessionsStartOptions): PromiseResult<SessionDTO> {
  const op = "sessionsStart"
  const parsed = a.safeParse(sessionsStartOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))
  }
  const { config, sessionConfig } = parsed.output
  const name = sessionResolveName(parsed.output.name, config.session)
  if (!name) {
    return createResultError(op, "name is required (options.name or config.session)")
  }
  return wahaRequest<SessionDTO>({
    config,
    method: "POST",
    path: wahaPathApi("/sessions/start"),
    body: {
      name,
      ...(sessionConfig !== undefined ? { config: sessionConfig } : {}),
    },
  })
}
