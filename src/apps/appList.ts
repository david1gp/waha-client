import type { AppListOptions } from "./appListOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { App } from "./app.js"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"
import { wahaResolveSession } from "../client/wahaResolveSession.js"

const appListOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
})

export async function appList(options: AppListOptions): PromiseResult<App[]> {
  const op = "appList"
  const parsed = a.safeParse(appListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, session } = parsed.output
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  return wahaRequest<App[]>({
    config,
    method: "GET",
    path: wahaPathApi("/apps"),
    query: { session: sessionR.data },
  })
}
