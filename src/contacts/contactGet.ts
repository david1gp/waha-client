import type { ContactGetOptions } from "./contactGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Contact } from "./contact.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const contactGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.pipe(a.string(), a.minLength(1)),
})

export async function contactGet(options: ContactGetOptions): PromiseResult<Contact> {
  const op = "contactGet"
  const parsed = a.safeParse(contactGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<Contact>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/contacts/${encodeURIComponent(id)}`),
  })
}
