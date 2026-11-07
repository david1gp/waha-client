import type { GroupSubGroup } from "./groupSubGroup.js"
import type { GroupSubgroupListOptions } from "./groupSubgroupListOptions.js"

import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupSubgroupListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.string(),
})

const groupSubGroupResponseSchema = a.object({
  id: a.string(),
  name: a.string(),
  isDefaultSubGroup: a.optional(a.boolean(), false),
})

export async function groupSubgroupList(options: GroupSubgroupListOptions): PromiseResult<GroupSubGroup[]> {
  const op = "groupSubgroupList"
  const parsed = a.safeParse(groupSubgroupListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const responseR = await wahaRequest<unknown>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/groups/${encodeURIComponent(id)}/subgroups`),
  })
  if (!responseR.success) return responseR
  if (!Array.isArray(responseR.data)) return createResultError(op, "Group subgroups response must be an array")

  const subGroups: GroupSubGroup[] = []
  for (const raw of responseR.data) {
    const subGroupR = a.safeParse(groupSubGroupResponseSchema, raw)
    if (!subGroupR.success) return createResultError(op, a.summarize(subGroupR.issues))
    subGroups.push({
      jid: subGroupR.output.id,
      name: subGroupR.output.name,
      isDefaultSubGroup: subGroupR.output.isDefaultSubGroup,
    })
  }
  return createResult(subGroups)
}
