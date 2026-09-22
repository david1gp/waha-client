import type { StatusMessageIdNewGetOptions } from "./statusMessageIdNewGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { NewMessageIDResponse } from "../messages/newMessageIDResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const statusMessageIdNewGetOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
})

export async function statusMessageIdNewGet(
  options: StatusMessageIdNewGetOptions,
): PromiseResult<NewMessageIDResponse> {
  const op = "statusMessageIdNewGet"
  const parsed = a.safeParse(statusMessageIdNewGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<NewMessageIDResponse>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/status/new-message-id"),
  })
}
