import type { SessionCappingGetOptions } from "./sessionCappingGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { MessageCappingData } from "./messageCappingData.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const sessionCappingGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function sessionCappingGet(options: SessionCappingGetOptions): PromiseResult<MessageCappingData> {
  const op = "sessionCappingGet"
  const parsed = a.safeParse(sessionCappingGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<MessageCappingData>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/capping"),
  })
}
