import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupDescriptionSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  description: a.string(),
})

export type GroupDescriptionSetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  description: string
}

export async function groupDescriptionSet(options: GroupDescriptionSetOptions): PromiseResult<boolean> {
  const op = "groupDescriptionSet"
  const parsed = a.safeParse(groupDescriptionSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id, description } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<boolean>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/description`),
    body: { description },
  })
}
