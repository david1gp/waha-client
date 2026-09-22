import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupRefreshOptions = {
  config: WahaClientConfig
  session?: string
}
