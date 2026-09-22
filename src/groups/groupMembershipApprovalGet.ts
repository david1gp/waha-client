import type { GroupMembershipApprovalGetOptions } from "./groupMembershipApprovalGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SettingsMembershipApproval } from "./settingsMembershipApproval.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupMembershipApprovalGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

export async function groupMembershipApprovalGet(
  options: GroupMembershipApprovalGetOptions,
): PromiseResult<SettingsMembershipApproval> {
  const op = "groupMembershipApprovalGet"
  const parsed = a.safeParse(groupMembershipApprovalGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<SettingsMembershipApproval>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/settings/security/membership-approval`),
  })
}
