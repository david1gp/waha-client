import type { MessageReactionSetOptions } from "./messageReactionSetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messageReactionSetOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  messageId: a.pipe(a.string(), a.minLength(1)),
  reaction: a.string(),
})

export async function messageReactionSet(options: MessageReactionSetOptions): PromiseResult<unknown> {
  const op = "messageReactionSet"
  const parsed = a.safeParse(messageReactionSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, messageId, reaction } = parsed.output

  return wahaRequest({
    config,
    method: "PUT",
    path: wahaPathApi("/reaction"),
    injectSession: true,
    body: bodyOmitUndefined({ session, messageId, reaction }),
  })
}
