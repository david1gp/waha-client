import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const contactBlockOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  contactId: a.pipe(a.string(), a.minLength(1)),
})

export type ContactBlockOptions = {
  config: WahaClientConfig
  session?: string
  contactId: string
}

/** POST /api/contacts/block — injects session into body. */
export async function contactBlock(options: ContactBlockOptions): PromiseResult<unknown> {
  const op = "contactBlock"
  const parsed = a.safeParse(contactBlockOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, contactId } = parsed.output
  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathApi("/contacts/block"),
    body: { session: parsed.output.session, contactId },
    injectSession: true,
  })
}
