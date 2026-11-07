import type { GroupMemberShareHistoryModeGetOptions } from "./groupMemberShareHistoryModeGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SettingsMemberShareHistoryMode } from "./settingsMemberShareHistoryMode.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupMemberShareHistoryModeGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

/** Cached read · GET /api/{session}/groups/{id}/settings/security/member-share-history-mode — share-history mode from engine store (may be stale). */
export async function groupMemberShareHistoryModeGet(
  options: GroupMemberShareHistoryModeGetOptions,
): PromiseResult<SettingsMemberShareHistoryMode> {
  const op = "groupMemberShareHistoryModeGet"
  const parsed = a.safeParse(groupMemberShareHistoryModeGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<SettingsMemberShareHistoryMode>({
    config,
    method: "GET",
    path: wahaPathSession(
      sessionR.data,
      `/groups/${encodeURIComponent(id)}/settings/security/member-share-history-mode`,
    ),
  })
}
