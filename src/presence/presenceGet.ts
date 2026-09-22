import type { PresenceGetOptions } from "./presenceGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaChatPresences } from "./wahaChatPresences.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const presenceGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
})

export async function presenceGet(options: PresenceGetOptions): PromiseResult<WahaChatPresences> {
  const op = "presenceGet"
  const parsed = a.safeParse(presenceGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WahaChatPresences>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/presence/${encodeURIComponent(chatId)}`),
  })
}
