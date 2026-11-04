import type { AppPurgeOptions } from "./appPurgeOptions.js"

import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"
import { wahaPathApi } from "../client/wahaPathApi.js"
import { wahaRequest } from "../client/wahaRequest.js"

const appPurgeOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  id: a.string(),
})

export async function appPurge(options: AppPurgeOptions): PromiseResult<undefined> {
  const op = "appPurge"
  const parsed = a.safeParse(appPurgeOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))

  const { config, id } = parsed.output
  return wahaRequest({
    config,
    method: "POST",
    path: wahaPathApi(`/apps/${encodeURIComponent(id)}/purge`),
    responseType: "void",
  })
}
