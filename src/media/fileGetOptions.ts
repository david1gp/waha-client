import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type FileGetOptions = {
  config: WahaClientConfig
  session?: string
  pathParts: string[]
}

/** GET /api/files/{session}/*parts → file bytes. */
