import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type SessionLogoutOptions = {
  config: WahaClientConfig
  session?: string
  apps?: {
    purge?: boolean
  }
}
