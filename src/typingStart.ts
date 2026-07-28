import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { TypingResult } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const typingStartOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
})

export type TypingStartOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}

export async function typingStart(options: TypingStartOptions): PromiseResult<TypingResult> {
  const op = "typingStart"
  const parsed = a.safeParse(typingStartOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId } = parsed.output

  return wahaRequest<TypingResult>({
    config,
    method: "POST",
    path: wahaPathApi("/startTyping"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId }),
  })
}
