import type { MessageButtonsReplyOptions } from "./messageButtonsReplyOptions.js"

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

const messageButtonsReplyOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  replyTo: a.pipe(a.string(), a.minLength(1)),
  selectedDisplayText: a.pipe(a.string(), a.minLength(1)),
  selectedButtonID: a.pipe(a.string(), a.minLength(1)),
})

export async function messageButtonsReply(options: MessageButtonsReplyOptions): PromiseResult<WAMessage> {
  const op = "messageButtonsReply"
  const parsed = a.safeParse(messageButtonsReplyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, replyTo, selectedDisplayText, selectedButtonID } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/send/buttons/reply"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, replyTo, selectedDisplayText, selectedButtonID }),
  })
}
