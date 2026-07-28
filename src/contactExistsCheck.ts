import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WANumberExistResult } from "./contactTypes.js"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const contactExistsCheckOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  phone: a.pipe(a.string(), a.minLength(1)),
})

export type ContactExistsCheckOptions = {
  config: WahaClientConfig
  session?: string
  phone: string
}

/** GET /api/contacts/check-exists?session=…&phone=… */
export async function contactExistsCheck(options: ContactExistsCheckOptions): PromiseResult<WANumberExistResult> {
  const op = "contactExistsCheck"
  const parsed = a.safeParse(contactExistsCheckOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, phone } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<WANumberExistResult>({
    config,
    method: "GET",
    path: wahaPathApi("/contacts/check-exists"),
    query: {
      session: sessionR.data,
      phone,
    },
  })
}
