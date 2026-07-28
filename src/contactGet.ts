import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { Contact } from "./contactTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const contactGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  id: a.pipe(a.string(), a.minLength(1)),
})

export type ContactGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}

/** GET /api/{session}/contacts/{id} */
export async function contactGet(options: ContactGetOptions): PromiseResult<Contact> {
  const op = "contactGet"
  const parsed = a.safeParse(contactGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, id } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<Contact>({
    config,
    method: "GET",
    path: wahaPathSession(sessionR.data, `/contacts/${encodeURIComponent(id)}`),
  })
}
