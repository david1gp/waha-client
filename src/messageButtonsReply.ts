import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messageButtonsReplyOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  replyTo: a.pipe(a.string(), a.minLength(1)),
  selectedDisplayText: a.pipe(a.string(), a.minLength(1)),
  selectedButtonID: a.pipe(a.string(), a.minLength(1)),
})

export type MessageButtonsReplyOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  replyTo: string
  selectedDisplayText: string
  selectedButtonID: string
}

export async function messageButtonsReply(options: MessageButtonsReplyOptions): PromiseResult<WAMessage> {
  const op = "messageButtonsReply"
  const parsed = a.safeParse(messageButtonsReplyOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, replyTo, selectedDisplayText, selectedButtonID } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/send/buttons/reply"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, replyTo, selectedDisplayText, selectedButtonID }),
  })
}
