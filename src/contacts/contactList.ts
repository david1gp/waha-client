import type { ContactListOptions } from "./contactListOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Contact } from "./contact.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const contactListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  contactId: a.pipe(a.string(), a.minLength(1)),
})

export async function contactList(options: ContactListOptions): PromiseResult<Contact> {
  const op = "contactList"
  const parsed = a.safeParse(contactListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, contactId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<Contact>({
    config,
    method: "GET",
    path: wahaPathApi("/contacts"),
    query: {
      session: sessionR.data,
      contactId,
    },
  })
}
