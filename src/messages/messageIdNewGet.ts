import type { MessageIdNewGetOptions } from "./messageIdNewGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { NewMessageIDResponse } from "./newMessageIDResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const messageIdNewGetOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
})

export async function messageIdNewGet(options: MessageIdNewGetOptions): PromiseResult<NewMessageIDResponse> {
  const op = "messageIdNewGet"
  const parsed = a.safeParse(messageIdNewGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<NewMessageIDResponse>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/new-message-id"),
  })
}
