import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SessionsStopOptions } from "./sessionsStopOptionsSchema.js"
import { sessionResolveName } from "./sessionResolveName.js"
import { sessionsStopOptionsSchema } from "./sessionsStopOptionsSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

/** @deprecated WAHA POST /api/sessions/stop */
export async function sessionsStop(options: SessionsStopOptions): PromiseResult<undefined> {
  const op = "sessionsStop"
  const parsed = a.safeParse(sessionsStopOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
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
