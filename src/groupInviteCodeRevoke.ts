import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupInviteCodeRevokeOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

export type GroupInviteCodeRevokeOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}

export async function groupInviteCodeRevoke(options: GroupInviteCodeRevokeOptions): PromiseResult<string> {
  const op = "groupInviteCodeRevoke"
  const parsed = a.safeParse(groupInviteCodeRevokeOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<string>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/invite-code/revoke`),
  })
}
