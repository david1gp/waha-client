import type { MessageLocationSendOptions } from "./messageLocationSendOptions.js"

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

const messageLocationSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  latitude: a.number(),
  longitude: a.number(),
  title: a.string(),
  id: a.optional(a.string()),
  reply_to: a.optional(a.string()),
})

export async function messageLocationSend(options: MessageLocationSendOptions): PromiseResult<WAMessage> {
  const op = "messageLocationSend"
  const parsed = a.safeParse(messageLocationSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, latitude, longitude, title, id, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendLocation"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, latitude, longitude, title, id, reply_to }),
  })
}
