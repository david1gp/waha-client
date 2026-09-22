import type { PresenceListOptions } from "./presenceListOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaChatPresences } from "./wahaChatPresences.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const presenceListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function presenceList(options: PresenceListOptions): PromiseResult<WahaChatPresences[]> {
  const op = "presenceList"
  const parsed = a.safeParse(presenceListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WahaChatPresences[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/presence"),
  })
}
