import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const fileGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  pathParts: a.array(a.string()),
})

export type FileGetOptions = {
  config: WahaClientConfig
  session?: string
  pathParts: string[]
}

/** GET /api/files/{session}/*parts → file bytes. */
export async function fileGet(options: FileGetOptions): PromiseResult<Uint8Array> {
  const op = "fileGet"
  const parsed = a.safeParse(fileGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  const { config, session, pathParts } = parsed.output
  if (pathParts.length === 0) {
    return createResultError(op, "pathParts must not be empty")
  }
  const sessionR = wahaResolveSession(op, config, session)
  if (!sessionR.success) return sessionR

  const rest = pathParts.map((p) => encodeURIComponent(p)).join("/")
  return wahaRequest({
    config,
    method: "GET",
    path: wahaPathApi(`/files/${encodeURIComponent(sessionR.data)}/${rest}`),
    responseType: "bytes",
  })
}
