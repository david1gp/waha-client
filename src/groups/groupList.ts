import type { GroupListOptions } from "./groupListOptions.js"

import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { groupInfoResponseNormalize } from "./groupInfoResponseNormalize.js"
import type { GroupInfo } from "./groupInfo.js"
import type { GroupsListFields } from "./groupsListFields.js"
import type { GroupsPagination } from "./groupsPagination.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const groupListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  limit: a.optional(a.number()),
  offset: a.optional(a.number()),
  sortBy: a.optional(a.string()),
  sortOrder: a.optional(a.picklist(["asc", "desc"])),
  exclude: a.optional(a.array(a.string())),
})

export async function groupList(options: GroupListOptions): PromiseResult<GroupInfo[]> {
  const op = "groupList"
  const parsed = a.safeParse(groupListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, limit, offset, sortBy, sortOrder, exclude } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const responseR = await wahaRequest<unknown>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, "/groups"),
    query: {
      limit,
      offset,
      sortBy,
      sortOrder,
      exclude: exclude?.[0],
    },
  })
  if (!responseR.success) return responseR
  if (!Array.isArray(responseR.data)) return createResultError(op, "Group response must be an array")

  const groups: GroupInfo[] = []
  for (const raw of responseR.data) {
    const groupR = groupInfoResponseNormalize(raw, op)
    if (!groupR.success) return groupR
    groups.push(groupR.data)
  }
  return createResult(groups)
}
