import type { PresenceSetOptions } from "./presenceSetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaPresenceStatus } from "./wahaPresenceStatus.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const presenceSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  presence: a.picklist(["offline", "online", "typing", "recording", "paused"]),
  chatId: a.optional(a.string()),
})

export async function presenceSet(options: PresenceSetOptions): PromiseResult<undefined> {
  const op = "presenceSet"
  const parsed = a.safeParse(presenceSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, presence, chatId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: Record<string, unknown> = { presence }
  if (chatId !== undefined) body.chatId = chatId

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/presence"),
    body,
    responseType: "void",
  })
}
