import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { type SessionsStopOptions, sessionResolveName, sessionsStopOptionsSchema } from "./sessionSchemas.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

/** @deprecated WAHA POST /api/sessions/stop */
export async function sessionsStop(options: SessionsStopOptions): PromiseResult<undefined> {
  const op = "sessionsStop"
  const parsed = a.safeParse(sessionsStopOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))
  }
  const { config, logout } = parsed.output
  const name = sessionResolveName(parsed.output.name, config.session)
  if (!name) {
    return createResultError(op, "name is required (options.name or config.session)")
  }
  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathApi("/sessions/stop"),
    body: {
      name,
      ...(logout !== undefined ? { logout } : {}),
    },
    responseType: "void",
  })
}
