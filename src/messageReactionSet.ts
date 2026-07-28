import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messageReactionSetOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  messageId: a.pipe(a.string(), a.minLength(1)),
  reaction: a.string(),
})

export type MessageReactionSetOptions = {
  config: WahaClientConfig
  session?: string
  messageId: string
  /** Emoji; empty string removes the reaction */
  reaction: string
}

export async function messageReactionSet(options: MessageReactionSetOptions): PromiseResult<unknown> {
  const op = "messageReactionSet"
  const parsed = a.safeParse(messageReactionSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, messageId, reaction } = parsed.output

  return wahaRequest({
    config,
    method: "PUT",
    path: wahaPathApi("/reaction"),
    injectSession: true,
    body: bodyOmitUndefined({ session, messageId, reaction }),
  })
}
