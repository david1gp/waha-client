import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SettingsMemberAddMode } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupMemberAddModeGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

export type GroupMemberAddModeGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}

export async function groupMemberAddModeGet(
  options: GroupMemberAddModeGetOptions,
): PromiseResult<SettingsMemberAddMode> {
  const op = "groupMemberAddModeGet"
  const parsed = a.safeParse(groupMemberAddModeGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<SettingsMemberAddMode>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/settings/security/member-add-mode`),
  })
}
