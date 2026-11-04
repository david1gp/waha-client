import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type AppSessionPurgeOptions = {
  config: WahaClientConfig
  app: string
  session?: string
}
