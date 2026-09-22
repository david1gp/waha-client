import type { ContactExistsCheckOptions } from "./contactExistsCheckOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WANumberExistResult } from "./waNumberExistResult.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const contactExistsCheckOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  phone: a.pipe(a.string(), a.minLength(1)),
})

export async function contactExistsCheck(options: ContactExistsCheckOptions): PromiseResult<WANumberExistResult> {
  const op = "contactExistsCheck"
  const parsed = a.safeParse(contactExistsCheckOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

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
