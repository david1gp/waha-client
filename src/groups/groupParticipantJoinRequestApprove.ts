import type { GroupParticipantJoinRequestApproveOptions } from "./groupParticipantJoinRequestApproveOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { GroupJoinRequestResult } from "./groupJoinRequestResult.js"
import type { GroupParticipantRef } from "./groupParticipantRef.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const participantSchema = a.object({ id: a.string() })

const groupParticipantJoinRequestApproveOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  participants: a.array(participantSchema),
})

export async function groupParticipantJoinRequestApprove(
  options: GroupParticipantJoinRequestApproveOptions,
): PromiseResult<GroupJoinRequestResult[]> {
  const op = "groupParticipantJoinRequestApprove"
  const parsed = a.safeParse(groupParticipantJoinRequestApproveOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id, participants } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<GroupJoinRequestResult[]>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/participants/join-requests/approve`),
    body: { participants },
  })
}
