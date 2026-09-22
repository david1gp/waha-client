import type { GroupInfoAdminOnlyGetOptions } from "./groupInfoAdminOnlyGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SettingsSecurityChangeInfo } from "./settingsSecurityChangeInfo.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupInfoAdminOnlyGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

export async function groupInfoAdminOnlyGet(
  options: GroupInfoAdminOnlyGetOptions,
): PromiseResult<SettingsSecurityChangeInfo> {
  const op = "groupInfoAdminOnlyGet"
  const parsed = a.safeParse(groupInfoAdminOnlyGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<SettingsSecurityChangeInfo>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/settings/security/info-admin-only`),
  })
}
