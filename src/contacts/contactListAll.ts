import type { ContactListAllOptions } from "./contactListAllOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Contact } from "./contact.js"
import type { ContactSortField } from "./contactSortField.js"
import type { SortOrder } from "../chats/sortOrder.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const contactListAllOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  limit: a.optional(a.number()),
  offset: a.optional(a.number()),
  sortBy: a.optional(a.picklist(["id", "name"] as const)),
  sortOrder: a.optional(a.picklist(["asc", "desc"] as const)),
})

export async function contactListAll(options: ContactListAllOptions): PromiseResult<Contact[]> {
  const op = "contactListAll"
  const parsed = a.safeParse(contactListAllOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
