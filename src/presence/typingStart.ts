import type { TypingStartOptions } from "./typingStartOptions.js"

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

const typingStartOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
})

export async function typingStart(options: TypingStartOptions): PromiseResult<TypingResult> {
  const op = "typingStart"
  const parsed = a.safeParse(typingStartOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId } = parsed.output

  return wahaRequest<TypingResult>({
    config,
    method: "POST",
    path: wahaPathApi("/startTyping"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId }),
  })
}
