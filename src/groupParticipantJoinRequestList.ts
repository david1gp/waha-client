import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { GroupJoinRequestResponse } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupParticipantJoinRequestListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

export type GroupParticipantJoinRequestListOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}

export async function groupParticipantJoinRequestList(
  options: GroupParticipantJoinRequestListOptions,
): PromiseResult<GroupJoinRequestResponse[]> {
  const op = "groupParticipantJoinRequestList"
  const parsed = a.safeParse(groupParticipantJoinRequestListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<GroupJoinRequestResponse[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/participants/join-requests`),
  })
}
