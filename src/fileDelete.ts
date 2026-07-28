import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"
import { wahaResolveSession } from "./wahaResolveSession.js"

const fileDeleteOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
  session: a.optional(a.string()),
  pathParts: a.array(a.string()),
})

export type FileDeleteOptions = {
  config: WahaClientConfig
  session?: string
  pathParts: string[]
}

/** DELETE /api/files/{session}/*parts. */
export async function fileDelete(options: FileDeleteOptions): PromiseResult<undefined> {
  const op = "fileDelete"
  const parsed = a.safeParse(fileDeleteOptionsSchema, options)
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
    method: "DELETE",
    path: wahaPathApi(`/files/${encodeURIComponent(sessionR.data)}/${rest}`),
    responseType: "void",
  })
}
