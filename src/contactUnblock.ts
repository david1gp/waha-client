import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const contactUnblockOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  contactId: a.pipe(a.string(), a.minLength(1)),
})

export type ContactUnblockOptions = {
  config: WahaClientConfig
  session?: string
  contactId: string
}

/** POST /api/contacts/unblock — injects session into body. */
export async function contactUnblock(options: ContactUnblockOptions): PromiseResult<unknown> {
  const op = "contactUnblock"
  const parsed = a.safeParse(contactUnblockOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, contactId } = parsed.output
  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathApi("/contacts/unblock"),
    body: { session: parsed.output.session, contactId },
    injectSession: true,
  })
}
