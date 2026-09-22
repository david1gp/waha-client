import type { WahaClientConfig } from "../client/wahaClientConfigSchema.js"

export type SessionTimelockGetOptions = {
  config: WahaClientConfig
  session?: string
}
