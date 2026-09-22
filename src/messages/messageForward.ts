import type { MessageForwardOptions } from "./messageForwardOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WAMessage } from "./waMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messageForwardOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  messageId: a.pipe(a.string(), a.minLength(1)),
  id: a.optional(a.string()),
})

export async function messageForward(options: MessageForwardOptions): PromiseResult<WAMessage> {
  const op = "messageForward"
  const parsed = a.safeParse(messageForwardOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, messageId, id } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/forwardMessage"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, messageId, id }),
  })
}
