import type { TypingStopOptions } from "./typingStopOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { chatIdSchema } from "../chats/chatIdSchema.js"
import { configSchema } from "../client/configSchema.js"
import { sessionOptionalSchema } from "../sessions/sessionOptionalSchema.js"
import type { TypingResult } from "../messages/typingResult.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const typingStopOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
})

export async function typingStop(options: TypingStopOptions): PromiseResult<TypingResult> {
  const op = "typingStop"
  const parsed = a.safeParse(typingStopOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId } = parsed.output

  return wahaRequest<TypingResult>({
    config,
    method: "POST",
    path: wahaPathApi("/stopTyping"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId }),
  })
}
