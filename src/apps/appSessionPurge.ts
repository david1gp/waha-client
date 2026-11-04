import type { AppSessionPurgeOptions } from "./appSessionPurgeOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const appSessionPurgeOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  app: a.string(),
  session: a.optional(a.string()),
})

export async function appSessionPurge(options: AppSessionPurgeOptions): PromiseResult<undefined> {
  const op = "appSessionPurge"
  const parsed = a.safeParse(appSessionPurgeOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, app, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathApi(`/apps/${encodeURIComponent(app)}/${encodeURIComponent(sessionR.data)}/purge`),
    responseType: "void",
  })
}
