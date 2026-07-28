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

const messageVoiceSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  file: wahaFileSchema,
  reply_to: a.optional(a.string()),
  convert: a.optional(a.boolean()),
})

export type MessageVoiceSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  file: WahaFile
  reply_to?: string
  convert?: boolean
}

export async function messageVoiceSend(options: MessageVoiceSendOptions): PromiseResult<WAMessage> {
  const op = "messageVoiceSend"
  const parsed = a.safeParse(messageVoiceSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, file, reply_to, convert } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendVoice"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, file, reply_to, convert }),
  })
}
