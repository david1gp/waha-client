import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { GroupParticipantRef } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const participantSchema = a.object({ id: a.string() })

const groupAdminPromoteOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  participants: a.array(participantSchema),
})

export type GroupAdminPromoteOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  participants: GroupParticipantRef[]
}

export async function groupAdminPromote(options: GroupAdminPromoteOptions): PromiseResult<unknown> {
  const op = "groupAdminPromote"
  const parsed = a.safeParse(groupAdminPromoteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id, participants } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/admin/promote`),
    body: { participants },
  })
}
