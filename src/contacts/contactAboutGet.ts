import type { ContactAboutGetOptions } from "./contactAboutGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ContactAbout } from "./contactAbout.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const contactAboutGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  contactId: a.pipe(a.string(), a.minLength(1)),
})

export async function contactAboutGet(options: ContactAboutGetOptions): PromiseResult<ContactAbout | null> {
  const op = "contactAboutGet"
  const parsed = a.safeParse(contactAboutGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
