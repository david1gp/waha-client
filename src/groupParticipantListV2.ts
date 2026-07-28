import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { GroupParticipant } from "./groupTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const groupParticipantListV2OptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

export type GroupParticipantListV2Options = {
  config: WahaClientConfig
  session?: string
  id: string
}

export async function groupParticipantListV2(
  options: GroupParticipantListV2Options,
): PromiseResult<GroupParticipant[]> {
  const op = "groupParticipantListV2"
  const parsed = a.safeParse(groupParticipantListV2OptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<GroupParticipant[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/participants/v2`),
  })
}
