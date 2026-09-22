import type { GroupMemberAddModeGetOptions } from "./groupMemberAddModeGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SettingsMemberAddMode } from "./settingsMemberAddMode.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupMemberAddModeGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

export async function groupMemberAddModeGet(
  options: GroupMemberAddModeGetOptions,
): PromiseResult<SettingsMemberAddMode> {
  const op = "groupMemberAddModeGet"
  const parsed = a.safeParse(groupMemberAddModeGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<SettingsMemberAddMode>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/settings/security/member-add-mode`),
  })
}
