import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SessionsStartOptions } from "./sessionsStartOptionsSchema.js"
import { sessionResolveName } from "./sessionResolveName.js"
import { sessionsStartOptionsSchema } from "./sessionsStartOptionsSchema.js"
import type { SessionDTO } from "./sessionDTO.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

/** @deprecated WAHA POST /api/sessions/start — upsert and start */
export async function sessionsStart(options: SessionsStartOptions): PromiseResult<SessionDTO> {
  const op = "sessionsStart"
  const parsed = a.safeParse(sessionsStartOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
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
