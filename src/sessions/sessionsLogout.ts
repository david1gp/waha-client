import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SessionsLogoutOptions } from "./sessionsLogoutOptionsSchema.js"
import { sessionResolveName } from "./sessionResolveName.js"
import { sessionsLogoutOptionsSchema } from "./sessionsLogoutOptionsSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

/** @deprecated WAHA POST /api/sessions/logout */
export async function sessionsLogout(options: SessionsLogoutOptions): PromiseResult<undefined> {
  const op = "sessionsLogout"
  const parsed = a.safeParse(sessionsLogoutOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
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
