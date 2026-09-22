import type { GroupMembershipApprovalSetOptions } from "./groupMembershipApprovalSetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupMembershipApprovalSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  newMembersApprovalRequired: a.boolean(),
})

export async function groupMembershipApprovalSet(options: GroupMembershipApprovalSetOptions): PromiseResult<boolean> {
  const op = "groupMembershipApprovalSet"
  const parsed = a.safeParse(groupMembershipApprovalSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
