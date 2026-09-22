import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type LidListOptions = {
  config: WahaClientConfig
  session?: string
  limit?: number
  offset?: number
}

/** GET /api/{session}/lids */
