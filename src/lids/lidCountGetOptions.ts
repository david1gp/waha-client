import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type LidCountGetOptions = {
  config: WahaClientConfig
  session?: string
}

/** GET /api/{session}/lids/count */
