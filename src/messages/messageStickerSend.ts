import type { MessageStickerSendOptions } from "./messageStickerSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WAMessage } from "./waMessage.js"
import type { WahaFile } from "../media/wahaFile.js"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import { wahaFileSchema } from "../media/wahaFileSchema.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messageStickerSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  file: wahaFileSchema,
  reply_to: a.optional(a.string()),
})

export async function messageStickerSend(options: MessageStickerSendOptions): PromiseResult<WAMessage> {
  const op = "messageStickerSend"
  const parsed = a.safeParse(messageStickerSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, file, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendSticker"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, file, reply_to }),
  })
}
