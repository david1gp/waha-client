import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messageForwardOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  messageId: a.pipe(a.string(), a.minLength(1)),
  id: a.optional(a.string()),
})

export type MessageForwardOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  messageId: string
  id?: string
}

export async function messageForward(options: MessageForwardOptions): PromiseResult<WAMessage> {
  const op = "messageForward"
  const parsed = a.safeParse(messageForwardOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, messageId, id } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/forwardMessage"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, messageId, id }),
  })
}
