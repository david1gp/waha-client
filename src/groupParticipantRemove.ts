import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { GroupParticipantRef } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const participantSchema = a.object({ id: a.string() })

const groupParticipantRemoveOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  participants: a.array(participantSchema),
})

export type GroupParticipantRemoveOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  participants: GroupParticipantRef[]
}

export async function groupParticipantRemove(options: GroupParticipantRemoveOptions): PromiseResult<unknown> {
  const op = "groupParticipantRemove"
  const parsed = a.safeParse(groupParticipantRemoveOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id, participants } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/participants/remove`),
    body: { participants },
  })
}
