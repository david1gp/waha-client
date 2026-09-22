import type { MessageButtonsSendOptions } from "./messageButtonsSendOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { messageButtonSchema } from "./messageButtonSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import { wahaFileSchema } from "../media/wahaFileSchema.js"
import type { MessageButton } from "./messageButton.js"
import type { WAMessage } from "./waMessage.js"
import type { WahaFile } from "../media/wahaFile.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

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

export async function messageButtonsSend(options: MessageButtonsSendOptions): PromiseResult<WAMessage> {
  const op = "messageButtonsSend"
  const parsed = a.safeParse(messageButtonsSendOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, header, headerImage, body, footer, buttons } = parsed.output

  return wahaRequest<WAMessage>({
    config,
    method: "POST",
    path: wahaPathApi("/sendButtons"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId, header, headerImage, body, footer, buttons }),
  })
}
