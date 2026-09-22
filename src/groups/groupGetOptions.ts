import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type GroupGetOptions = {
  config: WahaClientConfig
  session?: string
  id: string
}
