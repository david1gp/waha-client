import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupMemberAddModeSetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  membersCanAddNewMember: a.boolean(),
})

export type GroupMemberAddModeSetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
  membersCanAddNewMember: boolean
}

export async function groupMemberAddModeSet(options: GroupMemberAddModeSetOptions): PromiseResult<boolean | undefined> {
  const op = "groupMemberAddModeSet"
  const parsed = a.safeParse(groupMemberAddModeSetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id, membersCanAddNewMember } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<boolean | undefined>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/settings/security/member-add-mode`),
    body: { membersCanAddNewMember },
  })
}
