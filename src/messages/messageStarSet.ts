import type { MessageStarSetOptions } from "./messageStarSetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const messageStarSetOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  messageId: a.pipe(a.string(), a.minLength(1)),
  chatId: chatIdSchema,
  star: a.boolean(),
})

export async function messageStarSet(options: MessageStarSetOptions): PromiseResult<undefined> {
  const op = "messageStarSet"
  const parsed = a.safeParse(messageStarSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, messageId, chatId, star } = parsed.output

  return wahaRequest({
    config,
    method: "PUT",
    path: wahaPathApi("/star"),
    injectSession: true,
    body: bodyOmitUndefined({ session, messageId, chatId, star }),
    responseType: "void",
  })
}
