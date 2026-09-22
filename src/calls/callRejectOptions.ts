import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type CallRejectOptions = {
  config: WahaClientConfig
  session?: string
  from: string
  id: string
}
