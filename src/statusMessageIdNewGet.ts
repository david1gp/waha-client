import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { NewMessageIDResponse } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const statusMessageIdNewGetOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
})

export type StatusMessageIdNewGetOptions = {
  config: WahaClientConfig
  session?: string
}

export async function statusMessageIdNewGet(
  options: StatusMessageIdNewGetOptions,
): PromiseResult<NewMessageIDResponse> {
  const op = "statusMessageIdNewGet"
  const parsed = a.safeParse(statusMessageIdNewGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<NewMessageIDResponse>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/status/new-message-id"),
  })
}
