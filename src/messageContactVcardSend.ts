import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import {
  bodyOmitUndefined,
  chatIdSchema,
  configSchema,
  messageContactSchema,
  sessionOptionalSchema,
} from "./messageSchemas.js"
import type { MessageContact, WAMessage } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messageContactVcardSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  contacts: a.pipe(a.array(messageContactSchema), a.minLength(1)),
  id: a.optional(a.string()),
  reply_to: a.optional(a.string()),
})

export type MessageContactVcardSendOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  contacts: MessageContact[]
  id?: string
  reply_to?: string
}

export async function messageContactVcardSend(options: MessageContactVcardSendOptions): PromiseResult<WAMessage> {
  const op = "messageContactVcardSend"
  const parsed = a.safeParse(messageContactVcardSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId, contacts, id, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendContactVcard"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, contacts, id, reply_to }),
  })
}
