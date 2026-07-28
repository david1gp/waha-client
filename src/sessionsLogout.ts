import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { type SessionsLogoutOptions, sessionResolveName, sessionsLogoutOptionsSchema } from "./sessionSchemas.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

/** @deprecated WAHA POST /api/sessions/logout */
export async function sessionsLogout(options: SessionsLogoutOptions): PromiseResult<undefined> {
  const op = "sessionsLogout"
  const parsed = a.safeParse(sessionsLogoutOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))
  }
  const { config } = parsed.output
  const name = sessionResolveName(parsed.output.name, config.session)
  if (!name) {
    return createResultError(op, "name is required (options.name or config.session)")
  }
  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathApi("/sessions/logout"),
    body: { name },
    responseType: "void",
  })
}
