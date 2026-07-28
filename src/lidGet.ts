import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { LidToPhoneNumber } from "./contactTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const lidGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  lid: a.pipe(a.string(), a.minLength(1)),
})

export type LidGetOptions = {
  config: WahaClientConfig
  session?: string
  lid: string
}

/** GET /api/{session}/lids/{lid} */
export async function lidGet(options: LidGetOptions): PromiseResult<LidToPhoneNumber> {
  const op = "lidGet"
  const parsed = a.safeParse(lidGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, lid } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<LidToPhoneNumber>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/lids/${encodeURIComponent(lid)}`),
  })
}
