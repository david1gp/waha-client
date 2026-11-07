import type { PhoneNumbersCacheMemoryGetOptions } from "./phoneNumbersCacheMemoryGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { phoneNumbersAppNameSchema } from "./phoneNumbersAppNameSchema.js"
import { phoneNumbersCachePath } from "./phoneNumbersCachePath.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const phoneNumbersCacheMemoryGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  app: a.optional(phoneNumbersAppNameSchema),
  limit: a.optional(a.number()),
  offset: a.optional(a.number()),
})

/** WAHA-local read · GET /api/apps/{app}/{session}/cache/memory — phone-number cache (memory tier); no WhatsApp call. */
export async function phoneNumbersCacheMemoryGet(options: PhoneNumbersCacheMemoryGetOptions): PromiseResult<unknown[]> {
  const op = "phoneNumbersCacheMemoryGet"
  const parsed = a.safeParse(phoneNumbersCacheMemoryGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, app = "phone-numbers", limit, offset } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<unknown[]>({
    config,
    method: "GET",
    path: phoneNumbersCachePath(app, sessionR.data, "memory"),
    query: { limit, offset },
  })
}
