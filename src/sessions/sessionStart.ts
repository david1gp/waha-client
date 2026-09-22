import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SessionPathOptions } from "./sessionPathOptionsSchema.js"
import { sessionPathOptionsSchema } from "./sessionPathOptionsSchema.js"
import { sessionResolveName } from "./sessionResolveName.js"
import type { SessionDTO } from "./sessionDTO.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

export async function sessionStart(options: SessionPathOptions): PromiseResult<SessionDTO> {
  const op = "sessionStart"
  const parsed = a.safeParse(sessionPathOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues))
  }
  const { config } = parsed.output
  const session = sessionResolveName(parsed.output.session, config.session)
  if (!session) {
    return createResultError(op, "session is required (options.session or config.session)")
  }
  return wahaRequest<SessionDTO>({
    config,
    method: "POST",
    path: wahaPathApi(`/sessions/${encodeURIComponent(session)}/start`),
  })
}
