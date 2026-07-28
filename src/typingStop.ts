import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined, chatIdSchema, configSchema, sessionOptionalSchema } from "./messageSchemas.js"
import type { TypingResult } from "./chattingTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const typingStopOptionsSchema = a.object({
  config: configSchema,
  session: sessionOptionalSchema,
  chatId: chatIdSchema,
})

export type TypingStopOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}

export async function typingStop(options: TypingStopOptions): PromiseResult<TypingResult> {
  const op = "typingStop"
  const parsed = a.safeParse(typingStopOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId } = parsed.output

  return wahaRequest<TypingResult>({
    config,
    method: "POST",
    path: wahaPathApi("/stopTyping"),
    injectSession: true,
    body: bodyOmitUndefined({ session, chatId }),
  })
}
