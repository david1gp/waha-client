import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { type SessionCreateOptions, sessionCreateOptionsSchema } from "./sessionSchemas.js"
import type { SessionDTO } from "./sessionTypes.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

export async function sessionCreate(options: SessionCreateOptions): PromiseResult<SessionDTO> {
  const op = "sessionCreate"
  const parsed = a.safeParse(sessionCreateOptionsSchema, options)
  if (!parsed.success) {
    return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))
  }
  const { config, name, sessionConfig, apps, start } = parsed.output
  return wahaRequest<SessionDTO>({
    config,
    method: "POST",
    path: wahaPathApi("/sessions"),
    body: {
      ...(name !== undefined ? { name } : {}),
      ...(sessionConfig !== undefined ? { config: sessionConfig } : {}),
      ...(apps !== undefined ? { apps } : {}),
      ...(start !== undefined ? { start } : {}),
    },
  })
}
