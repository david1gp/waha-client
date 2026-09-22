import type { GroupCountGetOptions } from "./groupCountGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { CountResponse } from "../contacts/countResponse.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupCountGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function groupCountGet(options: GroupCountGetOptions): PromiseResult<CountResponse> {
  const op = "groupCountGet"
  const parsed = a.safeParse(groupCountGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<CountResponse>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/groups/count"),
  })
}
