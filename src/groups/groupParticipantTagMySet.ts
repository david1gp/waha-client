import type { GroupParticipantTagMySetOptions } from "./groupParticipantTagMySetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupParticipantTagMySetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
  tag: a.nullable(a.string()),
})

export async function groupParticipantTagMySet(options: GroupParticipantTagMySetOptions): PromiseResult<boolean> {
  const op = "groupParticipantTagMySet"
  const parsed = a.safeParse(groupParticipantTagMySetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id, tag } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<boolean>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/participants/v2/tags/my`),
    body: { tag },
  })
}
