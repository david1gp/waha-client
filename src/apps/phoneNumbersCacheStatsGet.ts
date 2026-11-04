import type { PhoneNumbersCacheStatsGetOptions } from "./phoneNumbersCacheStatsGetOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { phoneNumbersAppNameSchema } from "./phoneNumbersAppNameSchema.js"
import { phoneNumbersCachePath } from "./phoneNumbersCachePath.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const phoneNumbersCacheStatsGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  app: a.optional(phoneNumbersAppNameSchema),
})

export async function phoneNumbersCacheStatsGet(options: PhoneNumbersCacheStatsGetOptions): PromiseResult<unknown> {
  const op = "phoneNumbersCacheStatsGet"
  const parsed = a.safeParse(phoneNumbersCacheStatsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session, app = "phone-numbers" } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<unknown>({
    config,
    method: "GET",
    path: phoneNumbersCachePath(app, sessionR.data, "stats"),
  })
}
