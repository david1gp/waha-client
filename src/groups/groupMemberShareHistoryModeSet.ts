import type { GroupMemberShareHistoryModeSetOptions } from "./groupMemberShareHistoryModeSetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupMemberShareHistoryModeSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  membersCanShareHistory: a.boolean(),
})

export async function groupMemberShareHistoryModeSet(
  options: GroupMemberShareHistoryModeSetOptions,
): PromiseResult<boolean> {
  const op = "groupMemberShareHistoryModeSet"
  const parsed = a.safeParse(groupMemberShareHistoryModeSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id, membersCanShareHistory } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<boolean>({
    config,
    method: "PUT",
    path: wahaPathSession(
      sessionR.data,
      `/groups/${encodeURIComponent(id)}/settings/security/member-share-history-mode`,
    ),
    body: { membersCanShareHistory },
  })
}
