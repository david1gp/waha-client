import type { GroupCreateOptions } from "./groupCreateOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { groupInfoResponseNormalize } from "./groupInfoResponseNormalize.js"
import type { GroupCreateRequest } from "./groupCreateRequest.js"
import type { GroupInfo } from "./groupInfo.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const participantSchema = a.object({ id: a.string() })

const groupCreateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  name: a.string(),
  participants: a.array(participantSchema),
  isParent: a.optional(a.boolean()),
  linkedParentId: a.optional(a.string()),
})

export async function groupCreate(options: GroupCreateOptions): PromiseResult<GroupInfo> {
  const op = "groupCreate"
  const parsed = a.safeParse(groupCreateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, name, participants, isParent, linkedParentId } = parsed.output
  if (isParent === true && linkedParentId !== undefined) {
    return createResultError(op, "'isParent' and 'linkedParentId' are mutually exclusive")
  }
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const responseR = await wahaRequest<unknown>({
    config,
    method: "POST",
    path: wahaPathSession(sessionR.data, "/groups"),
    body: {
      name,
      participants,
      ...(isParent !== undefined ? { isParent } : {}),
      ...(linkedParentId !== undefined ? { linkedParentId } : {}),
    },
  })
  if (!responseR.success) return responseR
  return groupInfoResponseNormalize(responseR.data, op)
}
