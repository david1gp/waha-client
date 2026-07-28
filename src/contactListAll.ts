import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Contact, ContactSortField, SortOrder } from "./contactTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const contactListAllOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  limit: a.optional(a.number()),
  offset: a.optional(a.number()),
  sortBy: a.optional(a.picklist(["id", "name"] as const)),
  sortOrder: a.optional(a.picklist(["asc", "desc"] as const)),
})

export type ContactListAllOptions = {
  config: WahaClientConfig
  session?: string
  limit?: number
  offset?: number
  sortBy?: ContactSortField
  sortOrder?: SortOrder
}

/** GET /api/contacts/all?session=… */
export async function contactListAll(options: ContactListAllOptions): PromiseResult<Contact[]> {
  const op = "contactListAll"
  const parsed = a.safeParse(contactListAllOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, limit, offset, sortBy, sortOrder } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<Contact[]>({
    config,
    method: "GET",
    path: wahaPathApi("/contacts/all"),
    query: {
      session: sessionR.data,
      limit,
      offset,
      sortBy,
      sortOrder,
    },
  })
}
