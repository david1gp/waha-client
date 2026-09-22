import type { ContactUpdateOptions } from "./contactUpdateOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ContactUpdateBody } from "./contactUpdateBody.js"
import type { WahaResult } from "../client/wahaResult.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathSession } from "../client/wahaPathSession.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const contactUpdateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  firstName: a.pipe(a.string(), a.minLength(1)),
  lastName: a.pipe(a.string(), a.minLength(1)),
})

export async function contactUpdate(options: ContactUpdateOptions): PromiseResult<WahaResult> {
  const op = "contactUpdate"
  const parsed = a.safeParse(contactUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, chatId, firstName, lastName } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const body: ContactUpdateBody = { firstName, lastName }
  return wahaRequest<WahaResult>({
    config,
    method: "PUT",
    path: wahaPathSession(sessionR.data, `/contacts/${encodeURIComponent(chatId)}`),
    body,
  })
}
