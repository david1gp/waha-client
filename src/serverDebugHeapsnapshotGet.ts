import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import type { WahaClientConfig } from "./wahaClientConfig.js"
import { wahaPathApi } from "./wahaPath.js"
import { wahaRequest } from "./wahaRequest.js"

const serverDebugHeapsnapshotGetOptionsSchema = a.object({
  config: a.custom<WahaClientConfig>((v) => typeof v === "object" && v !== null),
})

export type ServerDebugHeapsnapshotGetOptions = {
  config: WahaClientConfig
}

export async function serverDebugHeapsnapshotGet(
  options: ServerDebugHeapsnapshotGetOptions,
): PromiseResult<Uint8Array> {
  const op = "serverDebugHeapsnapshotGet"
  const parsed = a.safeParse(serverDebugHeapsnapshotGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues), JSON.stringify(options))

  return wahaRequest({
    config: parsed.output.config,
    method: "GET",
    path: wahaPathApi("/server/debug/heapsnapshot"),
    responseType: "bytes",
  })
}
