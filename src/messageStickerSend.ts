import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WAMessage, WahaFile } from "./chattingTypes.js"
import {
  bodyOmitUndefined,
  chatIdSchema,
  configSchema,
  sessionOptionalSchema,
  wahaFileSchema,
} from "./messageSchemas.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messageStickerSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  file: wahaFileSchema,
  reply_to: a.optional(a.string()),
})

export type MessageStickerSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  file: WahaFile
  reply_to?: string
}

export async function messageStickerSend(options: MessageStickerSendOptions): PromiseResult<WAMessage> {
  const op = "messageStickerSend"
  const parsed = a.safeParse(messageStickerSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, file, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendSticker"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, file, reply_to }),
  })
}
