import type { LidCountGetOptions } from "./lidCountGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { CountResponse } from "../contacts/countResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const lidCountGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function lidCountGet(options: LidCountGetOptions): PromiseResult<CountResponse> {
  const op = "lidCountGet"
  const parsed = a.safeParse(lidCountGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<CountResponse>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/lids/count"),
  })
}
