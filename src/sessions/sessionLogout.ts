import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SessionLogoutOptions } from "./sessionLogoutOptions.js"
import { sessionResolveName } from "./sessionResolveName.js"
import type { SessionDTO } from "./sessionDTO.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaClientConfigSchema } from "../client/wahaClientConfigSchema.js"
import { wahaRequest } from "../client/wahaRequest.js"

const sessionLogoutOptionsSchema = a.object({
  config: wahaClientConfigSchema,
  session: a.optional(a.pipe(a.string(), a.minLength(1))),
  apps: a.optional(
    a.object({
      purge: a.optional(a.boolean()),
    }),
  ),
})

export async function sessionLogout(options: SessionLogoutOptions): PromiseResult<SessionDTO> {
  const op = "sessionLogout"
  const parsed = a.safeParse(sessionLogoutOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
  }
  const { config, apps } = parsed.output
  const session = sessionResolveName(parsed.output.session, config.session)
  if (!session) {
    return createResultError(op, "session is required (options.session or config.session)")
  }
  return wahaRequest<SessionDTO>({
    config,
    method: "POST",
    path: wahaPathApi(`/sessions/${encodeURIComponent(session)}/logout`),
    ...(apps !== undefined ? { body: { apps } } : {}),
  })
}
