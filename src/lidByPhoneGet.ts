import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { LidToPhoneNumber } from "./contactTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const lidByPhoneGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  phoneNumber: a.pipe(a.string(), a.minLength(1)),
})

export type LidByPhoneGetOptions = {
  config: WahaClientConfig
  session?: string
  phoneNumber: string
}

/** GET /api/{session}/lids/pn/{phoneNumber} */
export async function lidByPhoneGet(options: LidByPhoneGetOptions): PromiseResult<LidToPhoneNumber> {
  const op = "lidByPhoneGet"
  const parsed = a.safeParse(lidByPhoneGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, phoneNumber } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<LidToPhoneNumber>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/lids/pn/${encodeURIComponent(phoneNumber)}`),
  })
}
