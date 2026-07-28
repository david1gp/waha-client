import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  bodyOmitUndefined,
  chatIdSchema,
  configSchema,
  messageButtonSchema,
  sessionOptionalSchema,
  wahaFileSchema,
} from "./messageSchemas.js"
import type { MessageButton, WAMessage, WahaFile } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messageButtonsSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  header: a.optional(a.string()),
  headerImage: a.optional(wahaFileSchema),
  body: a.optional(a.string()),
  footer: a.optional(a.string()),
  buttons: a.pipe(a.array(messageButtonSchema), a.minLength(1), a.maxLength(4)),
})

export type MessageButtonsSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  header?: string
  headerImage?: WahaFile
  body?: string
  footer?: string
  buttons: MessageButton[]
}

export async function messageButtonsSend(options: MessageButtonsSendOptions): PromiseResult<WAMessage> {
  const op = "messageButtonsSend"
  const parsed = a.safeParse(messageButtonsSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, header, headerImage, body, footer, buttons } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendButtons"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, header, headerImage, body, footer, buttons }),
  })
}
