import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupSubjectSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  subject: a.string(),
})

export type GroupSubjectSetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  subject: string
}

export async function groupSubjectSet(options: GroupSubjectSetOptions): PromiseResult<boolean> {
  const op = "groupSubjectSet"
  const parsed = a.safeParse(groupSubjectSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id, subject } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<boolean>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/subject`),
    body: { subject },
  })
}
