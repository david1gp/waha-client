import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type ServerVersionGetOptions = {
  config: WahaClientConfig
}

/** GET /api/server/version (preferred over deprecated GET /api/version). */
