import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupMembershipApprovalSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  newMembersApprovalRequired: a.boolean(),
})

export type GroupMembershipApprovalSetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  newMembersApprovalRequired: boolean
}

export async function groupMembershipApprovalSet(options: GroupMembershipApprovalSetOptions): PromiseResult<boolean> {
  const op = "groupMembershipApprovalSet"
  const parsed = a.safeParse(groupMembershipApprovalSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id, newMembersApprovalRequired } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<boolean>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/settings/security/membership-approval`),
    body: { newMembersApprovalRequired },
  })
}
