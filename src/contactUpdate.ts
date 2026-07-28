import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { ContactUpdateBody } from "./contactTypes.js"
import type { WahaResult } from "./profileTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathSession } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const contactUpdateOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  chatId: a.pipe(a.string(), a.minLength(1)),
  firstName: a.pipe(a.string(), a.minLength(1)),
  lastName: a.pipe(a.string(), a.minLength(1)),
})

export type ContactUpdateOptions = {
  config: WahaClientConfig
  session?: string
  chatId: string
  firstName: string
  lastName: string
}

/** PUT /api/{session}/contacts/{chatId} */
export async function contactUpdate(options: ContactUpdateOptions): PromiseResult<WahaResult> {
  const op = "contactUpdate"
  const parsed = a.safeParse(contactUpdateOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

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
