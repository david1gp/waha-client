import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SettingsSecurityChangeInfo } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupInfoAdminOnlyGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

export type GroupInfoAdminOnlyGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}

export async function groupInfoAdminOnlyGet(
  options: GroupInfoAdminOnlyGetOptions,
): PromiseResult<SettingsSecurityChangeInfo> {
  const op = "groupInfoAdminOnlyGet"
  const parsed = a.safeParse(groupInfoAdminOnlyGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<SettingsSecurityChangeInfo>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/settings/security/info-admin-only`),
  })
}
