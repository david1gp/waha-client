import type { GroupMessagesAdminOnlySetOptions } from "./groupMessagesAdminOnlySetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { SettingsSecurityChangeInfo } from "./settingsSecurityChangeInfo.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupMessagesAdminOnlySetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  adminsOnly: a.boolean(),
})

export async function groupMessagesAdminOnlySet(
  options: GroupMessagesAdminOnlySetOptions,
): PromiseResult<SettingsSecurityChangeInfo | boolean> {
  const op = "groupMessagesAdminOnlySet"
  const parsed = a.safeParse(groupMessagesAdminOnlySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id, adminsOnly } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<SettingsSecurityChangeInfo | boolean>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/settings/security/messages-admin-only`),
    body: { adminsOnly },
  })
}
