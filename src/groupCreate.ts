import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { GroupCreateRequest, GroupInfo } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const participantSchema = a.object({ id: a.string() })

const groupCreateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  name: a.string(),
  participants: a.array(participantSchema),
})

export type GroupCreateOptions = {
  config: WahaClientConfig
  session?: string
  name: string
  participants: GroupCreateRequest["participants"]
}

export async function groupCreate(options: GroupCreateOptions): PromiseResult<GroupInfo> {
  const op = "groupCreate"
  const parsed = a.safeParse(groupCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, name, participants } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<GroupInfo>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/groups"),
    body: { name, participants },
  })
}
