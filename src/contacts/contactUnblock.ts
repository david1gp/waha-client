import type { ContactUnblockOptions } from "./contactUnblockOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const contactUnblockOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  contactId: a.pipe(a.string(), a.minLength(1)),
})

export async function contactUnblock(options: ContactUnblockOptions): PromiseResult<unknown> {
  const op = "contactUnblock"
  const parsed = a.safeParse(contactUnblockOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, contactId } = parsed.output
  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathApi("/contacts/unblock"),
    body: { session: parsed.output.session, contactId },
    injectSession: true,
  })
}
