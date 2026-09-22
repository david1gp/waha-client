import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type LidGetOptions = {
  config: WahaClientConfig
  session?: string
  lid: string
}

/** GET /api/{session}/lids/{lid} */
