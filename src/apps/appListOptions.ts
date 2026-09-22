import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type AppListOptions = {
  config: WahaClientConfig
  session?: string
}

/** GET /api/apps?session=… — always sends session (options.session ?? config.session). */
