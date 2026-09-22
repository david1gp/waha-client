import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupDeleteOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
