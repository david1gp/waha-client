import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const chatArchiveOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
})

export type ChatArchiveOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}

export async function chatArchive(options: ChatArchiveOptions): PromiseResult<unknown> {
  const op = "chatArchive"
  const parsed = a.safeParse(chatArchiveOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, `/chats/${encodeURIComponent(chatId)}/archive`),
  })
}
