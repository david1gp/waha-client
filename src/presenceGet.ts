import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaChatPresences } from "./presenceTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const presenceGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
})

export type PresenceGetOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
}

export async function presenceGet(options: PresenceGetOptions): PromiseResult<WahaChatPresences> {
  const op = "presenceGet"
  const parsed = a.safeParse(presenceGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, chatId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WahaChatPresences>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/presence/${encodeURIComponent(chatId)}`),
  })
}
