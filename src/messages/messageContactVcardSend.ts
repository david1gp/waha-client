import type { MessageContactVcardSendOptions } from "./messageContactVcardSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { messageContactSchema } from "./messageContactSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { MessageContact } from "./messageContact.js"
import type { WAMessage } from "./waMessage.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messageContactVcardSendOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
  contacts: a.pipe(a.array(messageContactSchema), a.minLength(1)),
  id: a.optional(a.string()),
  reply_to: a.optional(a.string()),
})

export async function messageContactVcardSend(options: MessageContactVcardSendOptions): PromiseResult<WAMessage> {
  const op = "messageContactVcardSend"
  const parsed = a.safeParse(messageContactVcardSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, contacts, id, reply_to } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendContactVcard"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, contacts, id, reply_to }),
  })
}
