import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SettingsSecurityChangeInfo } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupInfoAdminOnlySetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  adminsOnly: a.boolean(),
})

export type GroupInfoAdminOnlySetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  adminsOnly: boolean
}

export async function groupInfoAdminOnlySet(
  options: GroupInfoAdminOnlySetOptions,
): PromiseResult<SettingsSecurityChangeInfo | boolean> {
  const op = "groupInfoAdminOnlySet"
  const parsed = a.safeParse(groupInfoAdminOnlySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id, adminsOnly } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<SettingsSecurityChangeInfo | boolean>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/settings/security/info-admin-only`),
    body: { adminsOnly },
  })
}
