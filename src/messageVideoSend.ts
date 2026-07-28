import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  bodyOmitUndefined,
  chatIdSchema,
  configSchema,
  sessionOptionalSchema,
  wahaFileSchema,
} from "./messageSchemas.js"
import type { WAMessage, WahaFile } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messageVideoSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  file: wahaFileSchema,
  caption: a.optional(a.string()),
  mentions: a.optional(a.array(a.string())),
  reply_to: a.optional(a.string()),
  asNote: a.optional(a.boolean()),
  convert: a.optional(a.boolean()),
})

export type MessageVideoSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  file: WahaFile
  caption?: string
  mentions?: string[]
  reply_to?: string
  asNote?: boolean
  convert?: boolean
}

export async function messageVideoSend(options: MessageVideoSendOptions): PromiseResult<WAMessage> {
  const op = "messageVideoSend"
  const parsed = a.safeParse(messageVideoSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, file, caption, mentions, reply_to, asNote, convert } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendVideo"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, file, caption, mentions, reply_to, asNote, convert }),
  })
}
