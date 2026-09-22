import type { LidListOptions } from "./lidListOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { LidToPhoneNumber } from "./lidToPhoneNumber.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const lidListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  limit: a.optional(a.number()),
  offset: a.optional(a.number()),
})

export async function lidList(options: LidListOptions): PromiseResult<LidToPhoneNumber[]> {
  const op = "lidList"
  const parsed = a.safeParse(lidListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, limit, offset } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<LidToPhoneNumber[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/lids"),
    query: { limit, offset },
  })
}
