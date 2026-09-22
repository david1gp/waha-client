import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type FileDeleteOptions = {
  config: WahaClientConfig
  session?: string
  pathParts: string[]
}

/** DELETE /api/files/{session}/*parts. */
