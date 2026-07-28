import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const messageStarSetOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  messageId: a.pipe(a.string(), a.minLength(1)),
  chatId: chatIdSchema,
  star: a.boolean(),
})

export type MessageStarSetOptions = {
  config: WahaClientConfig
  session?: string
  messageId: string
  chatId: string
  star: boolean
}

export async function messageStarSet(options: MessageStarSetOptions): PromiseResult<undefined> {
  const op = "messageStarSet"
  const parsed = a.safeParse(messageStarSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

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
