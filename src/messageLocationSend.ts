import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

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

export type MessageLocationSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  latitude: number
  longitude: number
  title: string
  id?: string
  reply_to?: string
}

export async function messageLocationSend(options: MessageLocationSendOptions): PromiseResult<WAMessage> {
  const op = "messageLocationSend"
  const parsed = a.safeParse(messageLocationSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, latitude, longitude, title, id, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendLocation"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, latitude, longitude, title, id, reply_to }),
  })
}
