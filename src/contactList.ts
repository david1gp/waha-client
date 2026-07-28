import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Contact } from "./contactTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const contactListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  contactId: a.pipe(a.string(), a.minLength(1)),
})

export type ContactListOptions = {
  config: WahaClientConfig
  session?: string
  contactId: string
}

/** GET /api/contacts?session=…&contactId=… */
export async function contactList(options: ContactListOptions): PromiseResult<Contact> {
  const op = "contactList"
  const parsed = a.safeParse(contactListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

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
