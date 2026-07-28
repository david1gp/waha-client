import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ContactAbout } from "./contactTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const contactAboutGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  contactId: a.pipe(a.string(), a.minLength(1)),
})

export type ContactAboutGetOptions = {
  config: WahaClientConfig
  session?: string
  contactId: string
}

/** GET /api/contacts/about?session=…&contactId=… */
export async function contactAboutGet(options: ContactAboutGetOptions): PromiseResult<ContactAbout | null> {
  const op = "contactAboutGet"
  const parsed = a.safeParse(contactAboutGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, contactId } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<ContactAbout | null>({
    config,
    method: "GET",
    path: wahaPathApi("/contacts/about"),
    query: {
      session: sessionR.data,
      contactId,
    },
  })
}
