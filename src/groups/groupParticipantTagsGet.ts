import type { GroupParticipantTagsGetOptions } from "./groupParticipantTagsGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { GroupParticipantTag } from "./groupParticipantTag.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupParticipantTagsGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

/** Cached read · GET /api/{session}/groups/{id}/participants/v2/tags — participant tags from engine store synced from your WhatsApp account (may be stale). */
export async function groupParticipantTagsGet(
  options: GroupParticipantTagsGetOptions,
): PromiseResult<GroupParticipantTag[]> {
  const op = "groupParticipantTagsGet"
  const parsed = a.safeParse(groupParticipantTagsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<GroupParticipantTag[]>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/participants/v2/tags`),
  })
}
